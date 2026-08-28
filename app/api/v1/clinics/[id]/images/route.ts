import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase/server';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * @openapi
 * /api/v1/clinics/{id}/images:
 *   post:
 *     tags:
 *       - Clinics
 *     summary: Upload clinic image
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
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [logo, cover, gallery]
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *       400:
 *         description: Bad request / Invalid file
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    const clinic = await prisma.clinic.findUnique({ where: { clinicId } });
    if (!clinic) return jsonEnvelopeError('Clinic not found', 404);

    const formData = await req.formData().catch(() => null);
    if (!formData) return jsonEnvelopeError('Invalid form-data payload', 400);

    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    if (!file || !(file instanceof File)) {
      return jsonEnvelopeError('A valid file binary is required', 400);
    }

    if (!type || !['logo', 'cover', 'gallery'].includes(type)) {
      return jsonEnvelopeError('type must be one of: "logo", "cover", "gallery"', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return jsonEnvelopeError('Invalid file type. Only JPG, PNG, and WebP are allowed', 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonEnvelopeError('File size exceeds the 5MB limit', 400);
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `clinics/${clinicId}/${type}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('clinics')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[SUPABASE_STORAGE_UPLOAD_ERROR]:', uploadError);
      return jsonEnvelopeError(`Storage upload failed: ${uploadError.message}`, 500);
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from('clinics').getPublicUrl(filePath);
    const publicUrl = publicUrlData.publicUrl;

    const savedImage = await prisma.$transaction(async (tx) => {
      const img = await tx.clinicImage.create({
        data: {
          clinicId,
          type,
          url: publicUrl,
        },
      });

      if (type === 'logo') {
        await tx.clinic.update({
          where: { clinicId },
          data: { logoUrl: publicUrl },
        });
      } else if (type === 'cover') {
        await tx.clinic.update({
          where: { clinicId },
          data: { coverImageUrl: publicUrl },
        });
      }

      return img;
    });

    return jsonEnvelope(
      {
        imageID: savedImage.imageId,
        clinicID: savedImage.clinicId,
        type: savedImage.type,
        url: savedImage.url,
        uploadedAt: savedImage.uploadedAt.toISOString(),
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    console.error('[CLINIC_IMAGE_UPLOAD_ERROR]:', error);
    return jsonEnvelopeError('Failed to upload image', 500);
  }
}