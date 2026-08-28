import { NextRequest } from 'next/server';
import { supabaseAdmin, supabasePublic } from '@/lib/supabase/server';
import { jsonSuccess, jsonError, handleOptions } from '@/lib/utils/response';

// Handle CORS preflight request
export async function OPTIONS() {
  return handleOptions();
}

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login
 *     description: Authenticates a user with username (or email) and password. Returns user details and session tokens on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email address
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminID:
 *                       type: string
 *                     username:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     role:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Username and password are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Username and password are required
 *       401:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid username or password
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.username || !body.password) {
      return jsonError('Username and password are required', 400);
    }

    const { username, password } = body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password.trim()
    ) {
      return jsonError('Username and password are required', 400);
    }

    const trimmedUsername = username.trim();
    let targetEmail = trimmedUsername;

    if (!trimmedUsername.includes('@')) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

      if (listError || !usersData.users) {
        return jsonError('Invalid username or password', 401);
      }

      const matchedUser = usersData.users.find(
        (u) =>
          u.user_metadata?.username?.toLowerCase() === trimmedUsername.toLowerCase() ||
          u.email?.toLowerCase().startsWith(`${trimmedUsername.toLowerCase()}@`)
      );

      if (!matchedUser || !matchedUser.email) {
        return jsonError('Invalid username or password', 401);
      }

      targetEmail = matchedUser.email;
    }

    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: targetEmail,
      password: password,
    });

    if (authError || !authData.session || !authData.user) {
      return jsonError('Invalid username or password', 401);
    }

    const user = authData.user;
    const metadata = user.user_metadata || {};

    return jsonSuccess(
      {
        adminID: metadata.adminID || user.id,
        username: metadata.username || trimmedUsername,
        fullName: metadata.fullName || metadata.full_name || 'Administrator',
        role: metadata.role || 'SuperAdmin',
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
      'Login successful',
      200
    );
  } catch {
    return jsonError('Internal server error', 500);
  }
}