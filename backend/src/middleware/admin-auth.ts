/**
 * Admin Authentication Middleware
 * Uses existing admin_user table and JWT tokens
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { getPool } from '../config/database';

// Extend Express Request to include admin user
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach admin user to request
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = AuthService.verifyToken(token);

    // Get admin user from database
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, email, name, role, is_active as "isActive"
       FROM admin_user
       WHERE id = $1`,
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    const admin = result.rows[0];

    if (!admin.isActive) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Account is not active',
      });
    }

    // Attach admin to request
    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    console.error('Admin authentication error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Check if admin has super_admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Super admin access required',
    });
  }

  next();
}

/**
 * Check if admin has editor or super_admin role
 */
export function requireEditor(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (req.admin.role !== 'editor' && req.admin.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Editor or super admin access required',
    });
  }

  next();
}

/**
 * Check if admin has any of the specified roles
 */
export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
}
