import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
    return handleOptions();
}

/**
 * @openapi
 * /api/v1/locations:
 *   get:
 *     tags:
 *       - Locations
 *     summary: Get all locations
 *     description: Retrieve locations with pagination, search, and hierarchy filtering.
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
 *         name: locationType
 *         schema:
 *           type: string
 *           enum: [Province, District, City]
 *       - in: query
 *         name: parentLocationID
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
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
 *                   example: Locations retrieved successfully
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
 *                           locationID:
 *                             type: integer
 *                             example: 12
 *                           locationName:
 *                             type: string
 *                             example: Colombo
 *                           locationType:
 *                             type: string
 *                             example: District
 *                           parentLocationID:
 *                             type: integer
 *                             example: 1
 *                           isActive:
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
 *                           example: 78
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                     sorting:
 *                       type: object
 *                       properties:
 *                         sortBy:
 *                           type: string
 *                           example: locationName
 *                         sortOrder:
 *                           type: string
 *                           example: asc
 *                     search:
 *                       type: string
 *                       example: colombo
 *                     filters:
 *                       type: object
 *                       properties:
 *                         locationType:
 *                           type: string
 *                           example: District
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Locations
 *     summary: Create location
 *     description: Add a new geographic region to the directory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - locationName
 *               - locationType
 *             properties:
 *               locationName:
 *                 type: string
 *                 example: Colombo
 *               locationType:
 *                 type: string
 *                 enum: [Province, District, City]
 *                 example: District
 *               parentLocationID:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Location created successfully
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
 *                   example: Location created successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T10:35:22Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     locationID:
 *                       type: integer
 *                       example: 12
 *                     locationName:
 *                       type: string
 *                       example: Colombo
 *                     locationType:
 *                       type: string
 *                       example: District
 *                     parentLocationID:
 *                       type: integer
 *                       example: 1
 *                     isActive:
 *                       type: boolean
 *                       example: true
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
        const locationType = searchParams.get('locationType')?.trim() || undefined;
        const parentLocationIDParam = searchParams.get('parentLocationID');
        const parentLocationID =
            parentLocationIDParam !== null && parentLocationIDParam !== ''
                ? parseInt(parentLocationIDParam, 10)
                : undefined;
        const isActiveParam = searchParams.get('isActive');
        const isActive =
            isActiveParam !== null && isActiveParam !== '' ? isActiveParam === 'true' : undefined;

        const where: Prisma.LocationWhereInput = {
            ...(search ? { locationName: { contains: search, mode: 'insensitive' } } : {}),
            ...(locationType ? { locationType } : {}),
            ...(parentLocationID !== undefined && !isNaN(parentLocationID)
                ? { parentLocationId: parentLocationID }
                : {}),
            ...(isActive !== undefined ? { isActive } : {}),
        };

        const [totalItems, records] = await Promise.all([
            prisma.location.count({ where }),
            prisma.location.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { locationName: 'asc' },
            }),
        ]);

        const formattedItems = records.map((item) => ({
            locationID: item.locationId,
            locationName: item.locationName,
            locationType: item.locationType,
            parentLocationID: item.parentLocationId,
            isActive: item.isActive,
            createdAt: item.createdAt.toISOString(),
            ...(item.updatedAt ? { updatedAt: item.updatedAt.toISOString() } : {}),
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
                sorting: { sortBy: 'locationName', sortOrder: 'asc' },
                search: search || null,
                filters: {
                    locationType: locationType || null,
                    isActive: isActive !== undefined ? isActive : null,
                },
            },
            'Locations retrieved successfully',
            200
        );
    } catch (error) {
        console.error('[LOCATIONS_GET_ERROR]:', error);
        return jsonEnvelopeError('Failed to retrieve locations', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => null);

        if (!body || !body.locationName || !body.locationType) {
            return jsonEnvelopeError('locationName and locationType are required fields', 400);
        }

        const { locationName, locationType, parentLocationID, isActive } = body;

        const newLocation = await prisma.location.create({
            data: {
                locationName: String(locationName).trim(),
                locationType: String(locationType).trim(),
                parentLocationId:
                    parentLocationID !== undefined && parentLocationID !== null
                        ? Number(parentLocationID)
                        : null,
                isActive: typeof isActive === 'boolean' ? isActive : true,
            },
        });

        return jsonEnvelope(
            {
                locationID: newLocation.locationId,
                locationName: newLocation.locationName,
                locationType: newLocation.locationType,
                parentLocationID: newLocation.parentLocationId,
                isActive: newLocation.isActive,
                createdAt: newLocation.createdAt.toISOString(),
            },
            'Location created successfully',
            201
        );
    } catch (error) {
        console.error('[LOCATION_POST_ERROR]:', error);
        return jsonEnvelopeError('Failed to create location', 500);
    }
}