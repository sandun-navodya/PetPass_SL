import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/locations/{id}:
 *   get:
 *     tags:
 *       - Locations
 *     summary: Get location by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *       400:
 *         description: Invalid location ID format
 *       404:
 *         description: Location not found
 *   put:
 *     tags:
 *       - Locations
 *     summary: Update location
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationName:
 *                 type: string
 *                 example: Colombo District
 *               locationType:
 *                 type: string
 *                 example: District
 *               parentLocationID:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Location not found
 *   delete:
 *     tags:
 *       - Locations
 *     summary: Soft delete location
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       400:
 *         description: Invalid location ID format
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return jsonEnvelopeError('Invalid Location ID format', 400);

    const record = await prisma.location.findUnique({ where: { locationId } });
    if (!record) return jsonEnvelopeError('Location not found', 404);

    return jsonEnvelope(
      {
        locationID: record.locationId,
        locationName: record.locationName,
        locationType: record.locationType,
        parentLocationID: record.parentLocationId,
        isActive: record.isActive,
        createdAt: record.createdAt.toISOString(),
        ...(record.updatedAt ? { updatedAt: record.updatedAt.toISOString() } : {}),
      },
      'Location retrieved successfully',
      200
    );
  } catch (error) {
    console.error('[LOCATION_GET_BY_ID_ERROR]:', error);
    return jsonEnvelopeError('Failed to fetch location', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return jsonEnvelopeError('Invalid Location ID format', 400);

    const body = await req.json().catch(() => null);
    if (!body) return jsonEnvelopeError('Request body is required', 400);

    const data: Prisma.LocationUpdateInput = {};
    if (body.locationName !== undefined) data.locationName = String(body.locationName).trim();
    if (body.locationType !== undefined) data.locationType = String(body.locationType).trim();
    if (body.parentLocationID !== undefined) {
      data.parent = body.parentLocationID ? { connect: { locationId: Number(body.parentLocationID) } } : { disconnect: true };
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.location.update({
      where: { locationId },
      data,
    });

    return jsonEnvelope(
      {
        locationID: updated.locationId,
        locationName: updated.locationName,
        locationType: updated.locationType,
        parentLocationID: updated.parentLocationId,
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt?.toISOString() || new Date().toISOString(),
      },
      'Location updated successfully',
      200
    );
  } catch (error) {
    console.error('[LOCATION_PUT_ERROR]:', error);
    return jsonEnvelopeError('Failed to update location', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const locationId = parseInt(id, 10);
    if (isNaN(locationId)) return jsonEnvelopeError('Invalid Location ID format', 400);

    await prisma.location.update({
      where: { locationId },
      data: { isActive: false },
    });

    return jsonEnvelope(null, 'Location deleted successfully', 200);
  } catch (error) {
    console.error('[LOCATION_DELETE_ERROR]:', error);
    return jsonEnvelopeError('Failed to delete location', 500);
  }
}