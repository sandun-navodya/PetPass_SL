import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonEnvelope, jsonEnvelopeError, handleOptions } from '@/lib/utils/response';
import { Prisma } from '@prisma/client';

export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories
 *     description: Retrieve all pet service categories with pagination, search, and filtering.
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   example: Categories retrieved successfully
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
 *                           categoryID:
 *                             type: integer
 *                             example: 1
 *                           categoryName:
 *                             type: string
 *                             example: Pet Grooming
 *                           description:
 *                             type: string
 *                             example: Bathing, styling and hygiene services
 *                           icon:
 *                             type: string
 *                             example: https://cdn.petpass.lk/icons/grooming.svg
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
 *                           example: 9
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *                     sorting:
 *                       type: object
 *                       properties:
 *                         sortBy:
 *                           type: string
 *                           example: categoryName
 *                         sortOrder:
 *                           type: string
 *                           example: asc
 *                     search:
 *                       type: string
 *                       example: groom
 *                     filters:
 *                       type: object
 *                       properties:
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: Pet Grooming
 *               description:
 *                 type: string
 *                 example: Bathing, styling and hygiene services
 *               icon:
 *                 type: string
 *                 example: https://cdn.petpass.lk/icons/grooming.svg
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Category created successfully
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
 *                   example: Category created successfully
 *                 timestamp:
 *                   type: string
 *                   example: "2026-08-28T10:35:22Z"
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoryID:
 *                       type: integer
 *                       example: 1
 *                     categoryName:
 *                       type: string
 *                       example: Pet Grooming
 *                     description:
 *                       type: string
 *                       example: Bathing, styling and hygiene services
 *                     icon:
 *                       type: string
 *                       example: https://cdn.petpass.lk/icons/grooming.svg
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       example: "2026-08-28T10:35:22Z"
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const isActiveParam = searchParams.get('isActive');
    const isActive =
      isActiveParam !== null && isActiveParam !== '' ? isActiveParam === 'true' : undefined;

    const where: Prisma.CategoryWhereInput = {
      ...(search
        ? {
            OR: [
              { categoryName: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [totalItems, records] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { categoryName: 'asc' },
      }),
    ]);

    const formattedItems = records.map((item) => ({
      categoryID: item.categoryId,
      categoryName: item.categoryName,
      description: item.description,
      icon: item.icon,
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
        sorting: { sortBy: 'categoryName', sortOrder: 'asc' },
        search: search || null,
        filters: {
          isActive: isActive !== undefined ? isActive : null,
        },
      },
      'Categories retrieved successfully',
      200
    );
  } catch (error) {
    console.error('[CATEGORIES_GET_ERROR]:', error);
    return jsonEnvelopeError('Failed to retrieve categories', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.categoryName || !String(body.categoryName).trim()) {
      return jsonEnvelopeError('categoryName is required', 400);
    }

    const { categoryName, description, icon, isActive } = body;

    const newCategory = await prisma.category.create({
      data: {
        categoryName: String(categoryName).trim(),
        description: description ? String(description).trim() : null,
        icon: icon ? String(icon).trim() : null,
        isActive: typeof isActive === 'boolean' ? isActive : true,
      },
    });

    return jsonEnvelope(
      {
        categoryID: newCategory.categoryId,
        categoryName: newCategory.categoryName,
        description: newCategory.description,
        icon: newCategory.icon,
        isActive: newCategory.isActive,
        createdAt: newCategory.createdAt.toISOString(),
      },
      'Category created successfully',
      201
    );
  } catch (error) {
    console.error('[CATEGORY_POST_ERROR]:', error);
    return jsonEnvelopeError('Failed to create category', 500);
  }
}