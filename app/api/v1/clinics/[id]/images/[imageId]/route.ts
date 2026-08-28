import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/server';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics/{id}/images/{imageId}:
 *   delete:
 *     tags:
 *       - Clinics
 *     summary: Delete clinic image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 101
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: Image not found
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id, imageId } = await params;
    const clinicId = parseInt(id, 10);
    const parsedImageId = parseInt(imageId, 10);

    if (isNaN(clinicId) || isNaN(parsedImageId)) {
      return jsonEnvelopeError('Invalid clinic ID or image ID format', 400);
    }

    const imageRecord = await prisma.clinicImage.findFirst({
      where: {
        imageId: parsedImageId,
        clinicId,
      },
    });

    if (!imageRecord) {
      return jsonEnvelopeError('Image not found', 404);
    }

    try {
      const url = new URL(imageRecord.url);
      const parts = url.pathname.split('/clinics/');
      if (parts.length > 1) {
        const storagePath = parts[1];
        await supabaseAdmin.storage.from('clinics').remove([storagePath]);
      }
    } catch (storageErr) {
      console.warn('[STORAGE_REMOVE_WARNING]:', storageErr);
    }

    await prisma.$transaction(async (tx) => {
      await tx.clinicImage.delete({
        where: { imageId: parsedImageId },
      });

      if (imageRecord.type === 'logo') {
        await tx.clinic.update({
          where: { clinicId },
          data: { logoUrl: null },
        });
      } else if (imageRecord.type === 'cover') {
        await tx.clinic.update({
          where: { clinicId },
          data: { coverImageUrl: null },
        });
      }
    });

    return jsonEnvelope(null, 'Image deleted successfully', 200);
  } catch (error) {
    console.error('[CLINIC_IMAGE_DELETE_ERROR]:', error);
    return jsonEnvelopeError('Failed to delete image', 500);
  }
}