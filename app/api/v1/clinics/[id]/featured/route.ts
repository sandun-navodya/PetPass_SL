import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics/{id}/featured:
 *   patch:
 *     tags:
 *       - Clinics
 *     summary: Update clinic featured flag
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
 *               - isFeatured
 *             properties:
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Clinic featured status updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    const body = await req.json().catch(() => null);
    if (!body || typeof body.isFeatured !== 'boolean') {
      return jsonEnvelopeError('isFeatured (boolean) is required', 400);
    }

    const updated = await prisma.clinic.update({
      where: { clinicId },
      data: { isFeatured: body.isFeatured },
    });

    return jsonEnvelope(
      {
        clinicID: updated.clinicId,
        isFeatured: updated.isFeatured,
      },
      'Clinic featured status updated successfully',
      200
    );
  } catch (error) {
    console.error('[CLINIC_FEATURED_PATCH_ERROR]:', error);
    return jsonEnvelopeError('Failed to update clinic featured status', 500);
  }
}