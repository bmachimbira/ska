/**
 * Authentication Service
 * Handles password hashing, verification, and JWT token generation
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token for authenticated user
   */
  static generateToken(user: AdminUser): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
