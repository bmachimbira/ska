/**
 * Public Authentication Routes
 * Handles user registration, login, and profile management
 */

import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/database';
import { asyncHandler } from '../middleware/async-handler';
import { AuthService } from '../services/auth.service';

const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';

// Middleware to authenticate user token
async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required',
      });
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyToken(token);
    
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}

/**
 * POST /auth/register
 * Register a new user
 */
authRouter.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const pool = getPool();

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM app_user WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];
    const result = await pool.query(
      `INSERT INTO app_user (email, password_hash, name, first_name, last_name, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt"`,
      [email.toLowerCase(), passwordHash, fullName, firstName || null, lastName || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  })
);

/**
 * POST /auth/login
 * Login user
 */
authRouter.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const pool = getPool();

    // Get user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name as "firstName", last_name as "lastName"
       FROM app_user
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  })
);

/**
 * GET /auth/me
 * Get current user profile
 */
authRouter.get(
  '/me',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const pool = getPool();

    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.first_name as "firstName", u.last_name as "lastName",
        u.phone, u.created_at as "createdAt",
        json_agg(
          json_build_object(
            'churchId', cm.church_id,
            'churchName', c.name,
            'role', cm.role,
            'joinedAt', cm.joined_at
          )
        ) FILTER (WHERE cm.id IS NOT NULL) as churches
       FROM app_user u
       LEFT JOIN church_member cm ON u.id = cm.user_id
       LEFT JOIN church c ON cm.church_id = c.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
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
 * PUT /auth/profile
 * Update user profile
 */
authRouter.put(
  '/profile',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { firstName, lastName, phone } = req.body;
    const pool = getPool();

    const result = await pool.query(
      `UPDATE app_user
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone)
       WHERE id = $4
       RETURNING id, email, first_name as "firstName", last_name as "lastName", phone`,
      [firstName, lastName, phone, userId]
    );

    res.json({ user: result.rows[0] });
  })
);

/**
 * POST /auth/join-church
 * Join a church using invitation code
 */
authRouter.post(
  '/join-church',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { invitationCode } = req.body;

    if (!invitationCode) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invitation code is required',
      });
    }

    const pool = getPool();

    // Find church by invitation code
    const churchResult = await pool.query(
      `SELECT ci.church_id, c.name
       FROM church_invitation ci
       JOIN church c ON ci.church_id = c.id
       WHERE ci.code = $1 AND ci.is_active = true
       AND (ci.expires_at IS NULL OR ci.expires_at > NOW())
       AND (ci.max_uses IS NULL OR ci.uses_count < ci.max_uses)`,
      [invitationCode.toUpperCase()]
    );

    if (churchResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Invalid or expired invitation code',
      });
    }

    const church = { id: churchResult.rows[0].church_id, name: churchResult.rows[0].name };

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT id FROM church_member WHERE user_id = $1 AND church_id = $2',
      [userId, church.id]
    );

    if (existingMember.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already a member of this church',
      });
    }

    // Add as member
    await pool.query(
      `INSERT INTO church_member (church_id, user_id, role, joined_at)
       VALUES ($1, $2, 'member', NOW())`,
      [church.id, userId]
    );

    res.json({
      message: 'Successfully joined church',
      church: {
        id: church.id,
        name: church.name,
      },
    });
  })
);

/**
 * POST /auth/register-event
 * Register for a church event
 */
authRouter.post(
  '/register-event',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Event ID is required',
      });
    }

    const pool = getPool();

    // Get event details
    const eventResult = await pool.query(
      `SELECT id, title, max_attendees, registration_required
       FROM church_event
       WHERE id = $1 AND is_published = true`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Event not found',
      });
    }

    const event = eventResult.rows[0];

    if (!event.registration_required) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This event does not require registration',
      });
    }

    // Check if already registered
    const existingReg = await pool.query(
      'SELECT id FROM event_registration WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    if (existingReg.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already registered for this event',
      });
    }

    // Check capacity
    if (event.max_attendees) {
      const countResult = await pool.query(
        'SELECT COUNT(*) as count FROM event_registration WHERE event_id = $1',
        [eventId]
      );

      if (parseInt(countResult.rows[0].count) >= event.max_attendees) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Event is full',
        });
      }
    }

    // Register for event
    await pool.query(
      `INSERT INTO event_registration (event_id, user_id, registered_at)
       VALUES ($1, $2, NOW())`,
      [eventId, userId]
    );

    res.json({
      message: 'Successfully registered for event',
      event: {
        id: event.id,
        title: event.title,
      },
    });
  })
);

/**
 * GET /auth/my-events
 * Get user's registered events
 */
authRouter.get(
  '/my-events',
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const pool = getPool();

    const result = await pool.query(
      `SELECT 
        e.id, e.title, e.description, e.event_date as "eventDate",
        e.event_time as "eventTime", e.location, e.event_type as "eventType",
        c.name as "churchName", er.registered_at as "registeredAt"
       FROM event_registration er
       JOIN church_event e ON er.event_id = e.id
       JOIN church c ON e.church_id = c.id
       WHERE er.user_id = $1
       ORDER BY e.event_date DESC`,
      [userId]
    );

    res.json({ events: result.rows });
  })
);

export default authRouter;
