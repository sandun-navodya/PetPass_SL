import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics/{id}/status:
 *   patch:
 *     tags:
 *       - Clinics
 *     summary: Update clinic active status
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Clinic status updated successfully
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
    if (!body || typeof body.isActive !== 'boolean') {
      return jsonEnvelopeError('isActive (boolean) is required', 400);
    }

    const updated = await prisma.clinic.update({
      where: { clinicId },
      data: { isActive: body.isActive },
    });

    return jsonEnvelope(
      {
        clinicID: updated.clinicId,
        isActive: updated.isActive,
      },
      'Clinic status updated successfully',
      200
    );
  } catch (error) {
    console.error('[CLINIC_STATUS_PATCH_ERROR]:', error);
    return jsonEnvelopeError('Failed to update clinic status', 500);
  }
}