/**
 * Admin Routes
 * Protected routes for content management
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';
import { adminChurchesRouter } from './admin/churches';
import { requireAdminAuth, requireSuperAdmin } from '../middleware/admin-auth';

export const adminRouter = Router();

// Login request validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /admin/auth/login
 * Authenticate admin user and return JWT token
 */
adminRouter.post(
  '/auth/login',
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.errors,
      });
      return;
    }

    const { email, password } = result.data;

    // Query database for user
    const pool = getPool();
    const queryResult = await pool.query(
      `SELECT id, email, password_hash, name, role, is_active, last_login_at
       FROM admin_user
       WHERE email = $1`,
      [email]
    );

    if (queryResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = queryResult.rows[0];

    // Check if account is active
    if (!user.is_active) {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    // Verify password
    const isPasswordValid = await AuthService.verifyPassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Update last login timestamp
    await pool.query(
      'UPDATE admin_user SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = AuthService.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.is_active,
    });

    // Return user info and token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
      },
      token,
    });
  })
);

adminRouter.get(
  '/sermons',
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement admin sermon list
    res.json({ sermons: [] });
  })
);

// ============================================================================
// USER MANAGEMENT (Super Admin Only)
// ============================================================================

/**
 * GET /admin/users
 * List all admin users
 */
adminRouter.get(
  '/users',
  requireAdminAuth,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT 
        id,
        email,
        name,
        role,
        is_active as "isActive",
        last_login_at as "lastLoginAt",
        created_at as "createdAt"
       FROM admin_user
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  })
);

/**
 * PUT /admin/users/:userId
 * Update admin user
 */
adminRouter.put(
  '/users/:userId',
  requireAdminAuth,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { name, role, isActive } = req.body;

    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE admin_user
       SET 
         name = COALESCE($1, name),
         role = COALESCE($2, role),
         is_active = COALESCE($3, is_active),
         updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, name, role, is_active as "isActive"`,
      [name, role, isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({ user: result.rows[0] });
  })
);

/**
 * POST /admin/users
 * Create new admin user
 */
adminRouter.post(
  '/users',
  requireAdminAuth,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, name, password, role = 'reader' } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email, name, and password are required',
      });
    }

    const pool = getPool();

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM admin_user WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO admin_user (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_active as "isActive", created_at as "createdAt"`,
      [email, name, passwordHash, role]
    );

    res.status(201).json({ user: result.rows[0] });
  })
);

/**
 * DELETE /admin/users/:userId
 * Delete admin user
 */
adminRouter.delete(
  '/users/:userId',
  requireAdminAuth,
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (req.admin?.id === parseInt(userId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot delete your own account',
      });
    }

    const pool = getPool();
    
    const result = await pool.query(
      'DELETE FROM admin_user WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.json({ message: 'User deleted successfully' });
  })
);

// Church management routes
adminRouter.use('/churches', adminChurchesRouter);
