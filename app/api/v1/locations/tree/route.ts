import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/locations/tree:
 *   get:
 *     tags:
 *       - Locations
 *     summary: Location Tree
 *     description: Returns the full Province -> District -> City hierarchy in one nested payload.
 *     responses:
 *       200:
 *         description: Location tree retrieved successfully
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
 *                   example: Location tree retrieved successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T10:30:45Z"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       locationID:
 *                         type: integer
 *                         example: 1
 *                       locationName:
 *                         type: string
 *                         example: Western Province
 *                       locationType:
 *                         type: string
 *                         example: Province
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
export async function GET(_req: NextRequest) {
  try {
    const allLocations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { locationName: 'asc' },
    });

    interface TreeNode {
      locationID: number;
      locationName: string;
      locationType: string;
      parentLocationID: number | null;
      children: TreeNode[];
    }

    const map = new Map<number, TreeNode>();

    allLocations.forEach((loc) => {
      map.set(loc.locationId, {
        locationID: loc.locationId,
        locationName: loc.locationName,
        locationType: loc.locationType,
        parentLocationID: loc.parentLocationId,
        children: [],
      });
    });

    const tree: TreeNode[] = [];

    allLocations.forEach((loc) => {
      const node = map.get(loc.locationId);
      if (!node) return;

      if (loc.parentLocationId && map.has(loc.parentLocationId)) {
        map.get(loc.parentLocationId)!.children.push(node);
      } else if (loc.locationType === 'Province' || !loc.parentLocationId) {
        tree.push(node);
      }
    });

    return jsonEnvelope(tree, 'Location tree retrieved successfully', 200);
  } catch (error) {
    console.error('[LOCATION_TREE_GET_ERROR]:', error);
    return jsonEnvelopeError('Failed to load location hierarchy', 500);
  }
}