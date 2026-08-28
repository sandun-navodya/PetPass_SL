import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/categories/{id}/status:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Category Status
 *     description: Toggle or update the active status of a category.
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
 *                 example: false
 *     responses:
 *       200:
 *         description: Category status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Category status updated successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T11:05:00Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryID:
 *                       type: integer
 *                       example: 1
 *                     isActive:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) return jsonEnvelopeError('Invalid Category ID', 400);

    const body = await req.json().catch(() => null);
    if (!body || typeof body.isActive !== 'boolean') {
      return jsonEnvelopeError('isActive (boolean) is required', 400);
    }

    const updated = await prisma.category.update({
      where: { categoryId },
      data: { isActive: body.isActive },
    });

    return jsonEnvelope(
      {
        categoryID: updated.categoryId,
        isActive: updated.isActive,
      },
      'Category status updated successfully',
      200
    );
  } catch (error) {
    console.error('[CATEGORY_STATUS_PATCH_ERROR]:', error);
    return jsonEnvelopeError('Failed to update category status', 500);
  }
}