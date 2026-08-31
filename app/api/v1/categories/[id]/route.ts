import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/server';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * Extracts relative storage file path from a Supabase public URL
 */
function extractStoragePath(url: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    return index !== -1 ? url.substring(index + marker.length) : null;
  } catch {
    return null;
  }
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
 *     description: Update service category details. Accepts either multipart/form-data (with an optional logo file) or application/json.
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
 *         multipart/form-data:
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
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Category logo image (JPG, PNG, WebP, SVG, max 2MB)
 *               removeLogo:
 *                 type: boolean
 *                 description: Set true to delete existing logo without replacing
 *               isActive:
 *                 type: boolean
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
 *               logoUrl:
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
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Permanently delete category
 *     description: Hard deletes a category and removes its logo from storage. Blocks deletion if assigned to clinics.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Category permanently deleted successfully
 *       400:
 *         description: Invalid category ID format
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category in use by clinics or services
 *       500:
 *         description: Internal server error
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
        logoUrl: (record as any).logoUrl || null,
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

    const existing = await prisma.category.findUnique({ where: { categoryId } });
    if (!existing) return jsonEnvelopeError('Category not found', 404);

    const contentType = req.headers.get('content-type') || '';
    const data: Prisma.CategoryUpdateInput = {};
    let newLogoUrl: string | null = (existing as any).logoUrl || null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData().catch(() => null);
      if (!formData) return jsonEnvelopeError('Invalid form-data payload', 400);

      const categoryName = formData.get('categoryName');
      const description = formData.get('description');
      const icon = formData.get('icon');
      const isActive = formData.get('isActive');
      const removeLogo = formData.get('removeLogo') === 'true';
      const file = formData.get('logo') as File | null;

      if (categoryName !== null) {
        const trimmed = categoryName.toString().trim();
        if (!trimmed) return jsonEnvelopeError('categoryName cannot be empty', 400);
        data.categoryName = trimmed;
      }
      if (description !== null) data.description = description.toString().trim() || null;
      if (icon !== null) data.icon = icon.toString().trim() || null;
      if (isActive !== null) data.isActive = isActive === 'true' || isActive === '1';

      // 1. Remove existing image from storage if user requested removal or provided a replacement file
      const hasNewFile = file && file instanceof File && file.size > 0;
      if (removeLogo || hasNewFile) {
        if ((existing as any).logoUrl) {
          const oldPath = extractStoragePath((existing as any).logoUrl, 'categories');
          if (oldPath) {
            await supabaseAdmin.storage.from('categories').remove([oldPath]);
          }
        }
        newLogoUrl = null;
      }

      // 2. Upload replacement image if provided
      if (hasNewFile) {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
        if (!allowedMimes.includes(file.type)) {
          return jsonEnvelopeError('Invalid file type. Only JPG, PNG, WebP, and SVG are supported', 400);
        }

        if (file.size > 2 * 1024 * 1024) {
          return jsonEnvelopeError('Logo image size exceeds the 2MB limit', 400);
        }

        const fileExt = file.name.split('.').pop() || 'png';
        const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const storagePath = `service-logos/${cleanFileName}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabaseAdmin.storage
          .from('categories')
          .upload(storagePath, buffer, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('[SUPABASE_UPLOAD_ERROR]:', uploadError);
          return jsonEnvelopeError(`Failed to upload logo image: ${uploadError.message}`, 500);
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('categories')
          .getPublicUrl(storagePath);

        newLogoUrl = urlData.publicUrl;
      }

      (data as any).logoUrl = newLogoUrl;
    } else {
      // JSON body fallback
      const body = await req.json().catch(() => null);
      if (!body) return jsonEnvelopeError('Request body is required', 400);

      if (body.categoryName !== undefined) {
        const trimmed = String(body.categoryName).trim();
        if (!trimmed) return jsonEnvelopeError('categoryName cannot be empty', 400);
        data.categoryName = trimmed;
      }
      if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
      if (body.icon !== undefined) data.icon = body.icon ? String(body.icon).trim() : null;
      if (body.logoUrl !== undefined) (data as any).logoUrl = body.logoUrl ? String(body.logoUrl).trim() : null;
      if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    }

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
        logoUrl: (updated as any).logoUrl || null,
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

    const existing = await prisma.category.findUnique({
      where: { categoryId },
      include: {
        _count: {
          select: { clinicServices: true },
        },
      },
    });

    if (!existing) return jsonEnvelopeError('Category not found', 404);

    // Prevent foreign key violation if assigned to clinics
    if (existing._count.clinicServices > 0) {
      return jsonEnvelopeError(
        `Cannot permanently delete category: it is currently assigned to ${existing._count.clinicServices} clinic(s). Reassign them before deleting.`,
        409
      );
    }

    // Delete image from Supabase Storage if it exists
    if ((existing as any).logoUrl) {
      const storagePath = extractStoragePath((existing as any).logoUrl, 'categories');
      if (storagePath) {
        await supabaseAdmin.storage.from('categories').remove([storagePath]);
      }
    }

    // Permanent hard delete
    await prisma.category.delete({
      where: { categoryId },
    });

    return jsonEnvelope(null, 'Category permanently deleted successfully', 200);
  } catch (error) {
    console.error('[CATEGORY_DELETE_ERROR]:', error);
    return jsonEnvelopeError('Failed to permanently delete category', 500);
  }
}