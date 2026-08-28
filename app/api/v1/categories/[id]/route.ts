import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       400:
 *         description: Invalid category ID format
 *       404:
 *         description: Category not found
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
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
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Pet Grooming & Spa
 *               description:
 *                 type: string
 *                 example: Bathing and styling services
 *               icon:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Category not found
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Soft delete category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid category ID format
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) return jsonEnvelopeError('Invalid Category ID', 400);

    const record = await prisma.category.findUnique({ where: { categoryId } });
    if (!record) return jsonEnvelopeError('Category not found', 404);

    return jsonEnvelope(
      {
        categoryID: record.categoryId,
        categoryName: record.categoryName,
        description: record.description,
        icon: record.icon,
        isActive: record.isActive,
        createdAt: record.createdAt.toISOString(),
        ...(record.updatedAt ? { updatedAt: record.updatedAt.toISOString() } : {}),
      },
      'Category retrieved successfully',
      200
    );
  } catch (error) {
    console.error('[CATEGORY_GET_BY_ID_ERROR]:', error);
    return jsonEnvelopeError('Failed to fetch category', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) return jsonEnvelopeError('Invalid Category ID', 400);

    const body = await req.json().catch(() => null);
    if (!body) return jsonEnvelopeError('Request body is required', 400);

    const data: Prisma.CategoryUpdateInput = {};
    if (body.categoryName !== undefined) data.categoryName = String(body.categoryName).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.icon !== undefined) data.icon = body.icon ? String(body.icon).trim() : null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.category.update({
      where: { categoryId },
      data,
    });

    return jsonEnvelope(
      {
        categoryID: updated.categoryId,
        categoryName: updated.categoryName,
        description: updated.description,
        icon: updated.icon,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString() || new Date().toISOString(),
      },
      'Category updated successfully',
      200
    );
  } catch (error) {
    console.error('[CATEGORY_PUT_ERROR]:', error);
    return jsonEnvelopeError('Failed to update category', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) return jsonEnvelopeError('Invalid Category ID', 400);

    await prisma.category.update({
      where: { categoryId },
      data: { isActive: false },
    });

    return jsonEnvelope(null, 'Category deleted successfully', 200);
  } catch (error) {
    console.error('[CATEGORY_DELETE_ERROR]:', error);
    return jsonEnvelopeError('Failed to delete category', 500);
  }
}