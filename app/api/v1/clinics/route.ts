import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/clinics:
 *   get:
 *     tags:
 *       - Clinics
 *     summary: Get all clinics
 *     description: Retrieve veterinary clinics with pagination, search, location, active, and featured filters.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: locationID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Clinics retrieved successfully
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
 *                   example: Clinics retrieved successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T10:30:45Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           clinicID:
 *                             type: integer
 *                             example: 1
 *                           clinicName:
 *                             type: string
 *                             example: Green Paws Veterinary Clinic
 *                           logoUrl:
 *                             type: string
 *                             nullable: true
 *                             example: https://cdn.petpass.lk/clinics/1/logo.jpg
 *                           coverImageUrl:
 *                             type: string
 *                             nullable: true
 *                             example: https://cdn.petpass.lk/clinics/1/cover.jpg
 *                           locationID:
 *                             type: integer
 *                             example: 45
 *                           locationName:
 *                             type: string
 *                             example: Negombo
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           isFeatured:
 *                             type: boolean
 *                             example: true
 *                           createdAt:
 *                             type: string
 *                             example: "2026-08-28T14:21:10Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 32
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 4
 *                     sorting:
 *                       type: object
 *                       properties:
 *                         sortBy:
 *                           type: string
 *                           example: clinicName
 *                         sortOrder:
 *                           type: string
 *                           example: asc
 *                     search:
 *                       type: string
 *                       example: green paws
 *                     filters:
 *                       type: object
 *                       properties:
 *                         locationID:
 *                           type: integer
 *                           example: 45
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         isFeatured:
 *                           type: boolean
 *                           nullable: true
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Clinics
 *     summary: Create clinic
 *     description: Register a new veterinary clinic with location and optional service categories.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clinicName
 *               - locationID
 *               - address
 *               - phone
 *             properties:
 *               clinicName:
 *                 type: string
 *                 example: Green Paws Veterinary Clinic
 *               description:
 *                 type: string
 *                 example: Full-service veterinary care for dogs, cats and exotic pets
 *               locationID:
 *                 type: integer
 *                 example: 45
 *               address:
 *                 type: string
 *                 example: No. 24, Colombo Road, Negombo
 *               phone:
 *                 type: string
 *                 example: "0311234567"
 *               whatsapp:
 *                 type: string
 *                 example: "94771234567"
 *               email:
 *                 type: string
 *                 example: info@greenpaws.lk
 *               website:
 *                 type: string
 *                 example: https://greenpaws.lk
 *               openingHours:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: Monday
 *                     open:
 *                       type: string
 *                       example: "08:00"
 *                     close:
 *                       type: string
 *                       example: "20:00"
 *               mapLatitude:
 *                 type: number
 *                 example: 7.2083
 *               mapLongitude:
 *                 type: number
 *                 example: 79.8358
 *               serviceIDs:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [3, 7, 9]
 *     responses:
 *       201:
 *         description: Clinic created successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Clinic created successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T10:35:22Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clinicID:
 *                       type: integer
 *                       example: 1
 *                     clinicName:
 *                       type: string
 *                       example: Green Paws Veterinary Clinic
 *                     description:
 *                       type: string
 *                       example: Full-service veterinary care for dogs, cats and exotic pets
 *                     locationID:
 *                       type: integer
 *                       example: 45
 *                     address:
 *                       type: string
 *                       example: No. 24, Colombo Road, Negombo
 *                     phone:
 *                       type: string
 *                       example: "0311234567"
 *                     whatsapp:
 *                       type: string
 *                       example: "94771234567"
 *                     email:
 *                       type: string
 *                       example: info@greenpaws.lk
 *                     website:
 *                       type: string
 *                       example: https://greenpaws.lk
 *                     openingHours:
 *                       type: array
 *                       items:
 *                         type: object
 *                     mapLatitude:
 *                       type: number
 *                       example: 7.2083
 *                     mapLongitude:
 *                       type: number
 *                       example: 79.8358
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *                     coverImageUrl:
 *                       type: string
 *                       nullable: true
 *                     galleryUrls:
 *                       type: array
 *                       items:
 *                         type: string
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryID:
 *                             type: integer
 *                           categoryName:
 *                             type: string
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     isFeatured:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       example: "2026-08-28T10:35:22Z"
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const locationIDParam = searchParams.get('locationID');
    const locationID =
      locationIDParam !== null && locationIDParam !== '' ? parseInt(locationIDParam, 10) : undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive =
      isActiveParam !== null && isActiveParam !== '' ? isActiveParam === 'true' : undefined;
    const isFeaturedParam = searchParams.get('isFeatured');
    const isFeatured =
      isFeaturedParam !== null && isFeaturedParam !== '' ? isFeaturedParam === 'true' : undefined;

    const where: Prisma.ClinicWhereInput = {
      ...(search
        ? {
            OR: [
              { clinicName: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(locationID !== undefined && !isNaN(locationID) ? { locationId: locationID } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
    };

    const [totalItems, records] = await Promise.all([
      prisma.clinic.count({ where }),
      prisma.clinic.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { clinicName: 'asc' },
        include: {
          location: {
            select: {
              locationName: true,
            },
          },
        },
      }),
    ]);

    const formattedItems = records.map((clinic) => ({
      clinicID: clinic.clinicId,
      clinicName: clinic.clinicName,
      logoUrl: clinic.logoUrl,
      coverImageUrl: clinic.coverImageUrl,
      locationID: clinic.locationId,
      locationName: clinic.location?.locationName || '',
      isActive: clinic.isActive,
      isFeatured: clinic.isFeatured,
      createdAt: clinic.createdAt.toISOString(),
      ...(clinic.updatedAt ? { updatedAt: clinic.updatedAt.toISOString() } : {}),
    }));

    return jsonEnvelope(
      {
        items: formattedItems,
        pagination: {
          totalItems,
          page,
          limit,
          totalPages: Math.ceil(totalItems / limit) || 1,
        },
        sorting: { sortBy: 'clinicName', sortOrder: 'asc' },
        search: search || null,
        filters: {
          locationID: locationID !== undefined && !isNaN(locationID) ? locationID : null,
          isActive: isActive !== undefined ? isActive : null,
          isFeatured: isFeatured !== undefined ? isFeatured : null,
        },
      },
      'Clinics retrieved successfully',
      200
    );
  } catch (error) {
    console.error('[CLINICS_GET_ALL_ERROR]:', error);
    return jsonEnvelopeError('Failed to retrieve clinics', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.clinicName || !body.locationID || !body.address || !body.phone) {
      return jsonEnvelopeError('clinicName, locationID, address, and phone are required fields', 400);
    }

    const {
      clinicName,
      description,
      locationID,
      address,
      phone,
      whatsapp,
      email,
      website,
      openingHours,
      mapLatitude,
      mapLongitude,
      serviceIDs,
    } = body;

    const locId = parseInt(locationID, 10);
    if (isNaN(locId)) return jsonEnvelopeError('Invalid locationID format', 400);

    const locationExists = await prisma.location.findUnique({
      where: { locationId: locId },
    });
    if (!locationExists) return jsonEnvelopeError('Location does not exist', 404);

    const createdClinic = await prisma.$transaction(async (tx) => {
      const clinic = await tx.clinic.create({
        data: {
          clinicName: String(clinicName).trim(),
          description: description ? String(description).trim() : null,
          locationId: locId,
          address: String(address).trim(),
          phone: String(phone).trim(),
          whatsapp: whatsapp ? String(whatsapp).trim() : null,
          email: email ? String(email).trim() : null,
          website: website ? String(website).trim() : null,
          openingHours: openingHours || null,
          mapLatitude: mapLatitude !== undefined && mapLatitude !== null ? parseFloat(mapLatitude) : null,
          mapLongitude: mapLongitude !== undefined && mapLongitude !== null ? parseFloat(mapLongitude) : null,
          isActive: true,
          isFeatured: false,
        },
      });

      if (Array.isArray(serviceIDs) && serviceIDs.length > 0) {
        const uniqueCategoryIDs = Array.from(new Set(serviceIDs.map((id: any) => parseInt(id, 10)))).filter(
          (id) => !isNaN(id)
        );

        if (uniqueCategoryIDs.length > 0) {
          await tx.clinicService.createMany({
            data: uniqueCategoryIDs.map((catId) => ({
              clinicId: clinic.clinicId,
              categoryId: catId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.clinic.findUnique({
        where: { clinicId: clinic.clinicId },
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

    if (!createdClinic) return jsonEnvelopeError('Failed to create clinic record', 500);

    return jsonEnvelope(
      {
        clinicID: createdClinic.clinicId,
        clinicName: createdClinic.clinicName,
        description: createdClinic.description,
        locationID: createdClinic.locationId,
        address: createdClinic.address,
        phone: createdClinic.phone,
        whatsapp: createdClinic.whatsapp,
        email: createdClinic.email,
        website: createdClinic.website,
        openingHours: createdClinic.openingHours,
        mapLatitude: createdClinic.mapLatitude,
        mapLongitude: createdClinic.mapLongitude,
        logoUrl: createdClinic.logoUrl,
        coverImageUrl: createdClinic.coverImageUrl,
        galleryUrls: createdClinic.images.map((img) => img.url),
        services: createdClinic.services.map((s) => ({
          categoryID: s.category.categoryId,
          categoryName: s.category.categoryName,
        })),
        isActive: createdClinic.isActive,
        isFeatured: createdClinic.isFeatured,
        createdAt: createdClinic.createdAt.toISOString(),
      },
      'Clinic created successfully',
      201
    );
  } catch (error) {
    console.error('[CLINIC_CREATE_ERROR]:', error);
    return jsonEnvelopeError('Failed to create clinic', 500);
  }
}