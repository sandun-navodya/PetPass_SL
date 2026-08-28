import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics/{id}/services:
 *   put:
 *     tags:
 *       - Clinics
 *     summary: Assign service categories to clinic
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceIDs
 *             properties:
 *               serviceIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 7, 9, 11]
 *     responses:
 *       200:
 *         description: Clinic services updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (Number.isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.serviceIDs)) {
      return jsonEnvelopeError('serviceIDs (array of numbers) is required', 400);
    }

    const uniqueCategoryIDs: number[] = Array.from(
      new Set(body.serviceIDs.map((sId: unknown) => parseInt(String(sId), 10)))
    ).filter((sId): sId is number => !Number.isNaN(sId));

    const clinicExists = await prisma.clinic.findUnique({ where: { clinicId } });
    if (!clinicExists) return jsonEnvelopeError('Clinic not found', 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.clinicService.deleteMany({ where: { clinicId } });

      if (uniqueCategoryIDs.length > 0) {
        await tx.clinicService.createMany({
          data: uniqueCategoryIDs.map((catId: number) => ({
            clinicId,
            categoryId: catId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.clinic.findUnique({
        where: { clinicId },
        include: {
          services: {
            include: {
              category: {
                select: {
                  categoryId: true,
                  categoryName: true,
                },
              },
            },
          },
        },
      });
    });

    if (!updated) return jsonEnvelopeError('Failed to update clinic services', 500);

    return jsonEnvelope(
      {
        clinicID: updated.clinicId,
        services: updated.services.map((s: { category: { categoryId: number; categoryName: string } }) => ({
          categoryID: s.category.categoryId,
          categoryName: s.category.categoryName,
        })),
      },
      'Clinic services updated successfully',
      200
    );
  } catch (error) {
    console.error('[CLINIC_SERVICES_PUT_ERROR]:', error);
    return jsonEnvelopeError('Failed to update clinic services', 500);
  }
}