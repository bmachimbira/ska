/**
 * Admin Routes
 * Protected routes for content management
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';
import { AuthService } from '../services/auth.service';
import { z } from 'zod';

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
