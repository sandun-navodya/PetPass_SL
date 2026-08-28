import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics/{id}:
 *   get:
 *     tags:
 *       - Clinics
 *     summary: Get clinic by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Clinic retrieved successfully
 *       400:
 *         description: Invalid clinic ID format
 *       404:
 *         description: Clinic not found
 *   put:
 *     tags:
 *       - Clinics
 *     summary: Update clinic
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
 *               clinicName:
 *                 type: string
 *               description:
 *                 type: string
 *               locationID:
 *                 type: integer
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               openingHours:
 *                 type: array
 *                 items:
 *                   type: object
 *               mapLatitude:
 *                 type: number
 *               mapLongitude:
 *                 type: number
 *               serviceIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Clinic updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Clinic not found
 *   delete:
 *     tags:
 *       - Clinics
 *     summary: Soft delete clinic
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Clinic deleted successfully
 *       400:
 *         description: Invalid clinic ID format
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (Number.isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    const record = await prisma.clinic.findUnique({
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
        images: {
          where: { type: 'gallery' },
          select: { url: true },
        },
      },
    });

    if (!record) return jsonEnvelopeError('Clinic not found', 404);

    return jsonEnvelope(
      {
        clinicID: record.clinicId,
        clinicName: record.clinicName,
        description: record.description,
        locationID: record.locationId,
        address: record.address,
        phone: record.phone,
        whatsapp: record.whatsapp,
        email: record.email,
        website: record.website,
        openingHours: record.openingHours,
        mapLatitude: record.mapLatitude,
        mapLongitude: record.mapLongitude,
        logoUrl: record.logoUrl,
        coverImageUrl: record.coverImageUrl,
        galleryUrls: record.images.map((img: { url: string }) => img.url),
        services: record.services.map((s: { category: { categoryId: number; categoryName: string } }) => ({
          categoryID: s.category.categoryId,
          categoryName: s.category.categoryName,
        })),
        isActive: record.isActive,
        isFeatured: record.isFeatured,
        createdAt: record.createdAt.toISOString(),
        ...(record.updatedAt ? { updatedAt: record.updatedAt.toISOString() } : {}),
      },
      'Clinic retrieved successfully',
      200
    );
  } catch (error) {
    console.error('[CLINIC_GET_BY_ID_ERROR]:', error);
    return jsonEnvelopeError('Failed to fetch clinic', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (Number.isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    const body = await req.json().catch(() => null);
    if (!body) return jsonEnvelopeError('Request body is required', 400);

    const exists = await prisma.clinic.findUnique({ where: { clinicId } });
    if (!exists) return jsonEnvelopeError('Clinic not found', 404);

    const data: Prisma.ClinicUpdateInput = {};
    if (body.clinicName !== undefined) data.clinicName = String(body.clinicName).trim();
    if (body.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body.locationID !== undefined) {
      const locId = parseInt(body.locationID, 10);
      if (Number.isNaN(locId)) return jsonEnvelopeError('Invalid locationID format', 400);
      data.location = { connect: { locationId: locId } };
    }
    if (body.address !== undefined) data.address = String(body.address).trim();
    if (body.phone !== undefined) data.phone = String(body.phone).trim();
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp ? String(body.whatsapp).trim() : null;
    if (body.email !== undefined) data.email = body.email ? String(body.email).trim() : null;
    if (body.website !== undefined) data.website = body.website ? String(body.website).trim() : null;
    if (body.openingHours !== undefined) data.openingHours = body.openingHours;
    if (body.mapLatitude !== undefined) data.mapLatitude = body.mapLatitude !== null ? parseFloat(body.mapLatitude) : null;
    if (body.mapLongitude !== undefined) data.mapLongitude = body.mapLongitude !== null ? parseFloat(body.mapLongitude) : null;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured);

    const updatedClinic = await prisma.$transaction(async (tx) => {
      await tx.clinic.update({
        where: { clinicId },
        data,
      });

      if (Array.isArray(body.serviceIDs)) {
        await tx.clinicService.deleteMany({ where: { clinicId } });

        const uniqueCategoryIDs: number[] = Array.from(
          new Set(body.serviceIDs.map((sId: unknown) => parseInt(String(sId), 10)))
        ).filter((sId): sId is number => !Number.isNaN(sId));

        if (uniqueCategoryIDs.length > 0) {
          await tx.clinicService.createMany({
            data: uniqueCategoryIDs.map((catId: number) => ({
              clinicId,
              categoryId: catId,
            })),
            skipDuplicates: true,
          });
        }
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
          images: {
            where: { type: 'gallery' },
            select: { url: true },
          },
        },
      });
    });

    if (!updatedClinic) return jsonEnvelopeError('Failed to update clinic record', 500);

    return jsonEnvelope(
      {
        clinicID: updatedClinic.clinicId,
        clinicName: updatedClinic.clinicName,
        description: updatedClinic.description,
        locationID: updatedClinic.locationId,
        address: updatedClinic.address,
        phone: updatedClinic.phone,
        whatsapp: updatedClinic.whatsapp,
        email: updatedClinic.email,
        website: updatedClinic.website,
        openingHours: updatedClinic.openingHours,
        mapLatitude: updatedClinic.mapLatitude,
        mapLongitude: updatedClinic.mapLongitude,
        logoUrl: updatedClinic.logoUrl,
        coverImageUrl: updatedClinic.coverImageUrl,
        galleryUrls: updatedClinic.images.map((img: { url: string }) => img.url),
        services: updatedClinic.services.map((s: { category: { categoryId: number; categoryName: string } }) => ({
          categoryID: s.category.categoryId,
          categoryName: s.category.categoryName,
        })),
        isActive: updatedClinic.isActive,
        isFeatured: updatedClinic.isFeatured,
        createdAt: updatedClinic.createdAt.toISOString(),
        updatedAt: updatedClinic.updatedAt?.toISOString() || new Date().toISOString(),
      },
      'Clinic updated successfully',
      200
    );
  } catch (error) {
    console.error('[CLINIC_PUT_ERROR]:', error);
    return jsonEnvelopeError('Failed to update clinic', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const clinicId = parseInt(id, 10);
    if (Number.isNaN(clinicId)) return jsonEnvelopeError('Invalid Clinic ID format', 400);

    await prisma.clinic.update({
      where: { clinicId },
      data: { isActive: false },
    });

    return jsonEnvelope(null, 'Clinic deleted successfully', 200);
  } catch (error) {
    console.error('[CLINIC_DELETE_ERROR]:', error);
    return jsonEnvelopeError('Failed to delete clinic', 500);
  }
}