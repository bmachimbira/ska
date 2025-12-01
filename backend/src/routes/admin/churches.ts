/**
 * Admin Church Management Routes
 * Protected routes for church administration
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler';
import { requireAdminAuth, requireSuperAdmin } from '../../middleware/admin-auth';
import { getPool } from '../../config/database';

export const adminChurchesRouter = Router();

// All routes require admin authentication
adminChurchesRouter.use(requireAdminAuth);

// ============================================================================
// CHURCH CRUD
// ============================================================================

/**
 * POST /v1/admin/churches
 * Create a new church (global admin only)
 */
adminChurchesRouter.post(
  '/',
  requireSuperAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      slug,
      description,
      address,
      city,
      state,
      country = 'Zimbabwe',
      postalCode,
      latitude,
      longitude,
      phone,
      email,
      website,
      timezone = 'Africa/Harare',
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name and slug are required',
      });
    }

    const pool = getPool();

    // Check if slug already exists
    const existing = await pool.query(
      'SELECT id FROM church WHERE slug = $1',
      [slug]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Church with this slug already exists',
      });
    }

    const result = await pool.query(
      `INSERT INTO church (
        name, slug, description, address, city, state, country,
        postal_code, latitude, longitude, phone, email, website, timezone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, name, slug, city, country, created_at as "createdAt"`,
      [name, slug, description, address, city, state, country, postalCode,
       latitude, longitude, phone, email, website, timezone]
    );

    res.status(201).json({ church: result.rows[0] });
  })
);

/**
 * PUT /v1/admin/churches/:churchId
 * Update church details (any admin can update)
 */
adminChurchesRouter.put(
  '/:churchId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postalCode,
      latitude,
      longitude,
      phone,
      email,
      website,
      isActive,
    } = req.body;

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        country = COALESCE($6, country),
        postal_code = COALESCE($7, postal_code),
        latitude = COALESCE($8, latitude),
        longitude = COALESCE($9, longitude),
        phone = COALESCE($10, phone),
        email = COALESCE($11, email),
        website = COALESCE($12, website),
        is_active = COALESCE($13, is_active),
        updated_at = NOW()
      WHERE id = $14
      RETURNING id, name, slug, city, updated_at as "updatedAt"`,
      [name, description, address, city, state, country, postalCode,
       latitude, longitude, phone, email, website, isActive, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Church not found',
      });
    }

    res.json({ church: result.rows[0] });
  })
);

// ============================================================================
// MEMBER MANAGEMENT
// ============================================================================

/**
 * GET /v1/admin/churches/:churchId/members
 * List church members
 */
adminChurchesRouter.get(
  '/:churchId/members',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const pool = getPool();

    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT
        cm.id,
        cm.role,
        cm.is_primary as "isPrimary",
        cm.joined_at as "joinedAt",
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM church_member cm
      JOIN app_user u ON cm.user_id = u.id
      WHERE cm.church_id = $1
      ORDER BY cm.role DESC, cm.joined_at DESC
      LIMIT $2 OFFSET $3`,
      [churchId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM church_member WHERE church_id = $1',
      [churchId]
    );

    res.json({
      members: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit)),
      },
    });
  })
);

/**
 * PUT /v1/admin/churches/:churchId/members/:memberId/role
 * Update member role
 */
adminChurchesRouter.put(
  '/:churchId/members/:memberId/role',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, memberId } = req.params;
    const { role } = req.body;

    const validRoles = ['member', 'elder', 'deacon', 'pastor', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_member
       SET role = $1, updated_at = NOW()
       WHERE id = $2 AND church_id = $3
       RETURNING id, role, updated_at as "updatedAt"`,
      [role, memberId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Member not found',
      });
    }

    res.json({ member: result.rows[0] });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/members/:memberId
 * Remove member from church
 */
adminChurchesRouter.delete(
  '/:churchId/members/:memberId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, memberId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_member WHERE id = $1 AND church_id = $2 RETURNING id',
      [memberId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Member not found',
      });
    }

    res.json({ message: 'Member removed successfully' });
  })
);

// ============================================================================
// DEVOTIONAL MANAGEMENT
// ============================================================================

/**
 * POST /v1/admin/churches/:churchId/devotionals
 * Create church devotional
 */
adminChurchesRouter.post(
  '/:churchId/devotionals',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { title, bodyMd, scriptureRefs, date, isPublished = false } = req.body;

    if (!title || !bodyMd || !date) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title, content, and date are required',
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO church_devotional (
        church_id, author_id, title, body_md, scripture_refs, date, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, date, is_published as "isPublished", created_at as "createdAt"`,
      [churchId, req.admin!.id, title, bodyMd, scriptureRefs, date, isPublished]
    );

    res.status(201).json({ devotional: result.rows[0] });
  })
);

/**
 * PUT /v1/admin/churches/:churchId/devotionals/:devotionalId
 * Update church devotional
 */
adminChurchesRouter.put(
  '/:churchId/devotionals/:devotionalId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, devotionalId } = req.params;
    const { title, bodyMd, scriptureRefs, date, isPublished } = req.body;

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_devotional SET
        title = COALESCE($1, title),
        body_md = COALESCE($2, body_md),
        scripture_refs = COALESCE($3, scripture_refs),
        date = COALESCE($4, date),
        is_published = COALESCE($5, is_published),
        updated_at = NOW()
      WHERE id = $6 AND church_id = $7
      RETURNING id, title, date, is_published as "isPublished", updated_at as "updatedAt"`,
      [title, bodyMd, scriptureRefs, date, isPublished, devotionalId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Devotional not found',
      });
    }

    res.json({ devotional: result.rows[0] });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/devotionals/:devotionalId
 * Delete church devotional
 */
adminChurchesRouter.delete(
  '/:churchId/devotionals/:devotionalId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, devotionalId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_devotional WHERE id = $1 AND church_id = $2 RETURNING id',
      [devotionalId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Devotional not found',
      });
    }

    res.json({ message: 'Devotional deleted successfully' });
  })
);

// ============================================================================
// EVENT MANAGEMENT
// ============================================================================

/**
 * POST /v1/admin/churches/:churchId/events
 * Create church event
 */
adminChurchesRouter.post(
  '/:churchId/events',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const {
      title,
      description,
      eventDate,
      eventTime,
      endDate,
      endTime,
      location,
      speakerId,
      eventType = 'other',
      maxAttendees,
      registrationRequired = false,
      registrationUrl,
      isPublished = false,
      isFeatured = false,
    } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title and event date are required',
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO church_event (
        church_id, title, description, event_date, event_time, end_date, end_time,
        location, speaker_id, event_type, max_attendees, registration_required,
        registration_url, is_published, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id, title, event_date as "eventDate", is_published as "isPublished", created_at as "createdAt"`,
      [churchId, title, description, eventDate, eventTime, endDate, endTime,
       location, speakerId, eventType, maxAttendees, registrationRequired,
       registrationUrl, isPublished, isFeatured, req.admin!.id]
    );

    res.status(201).json({ event: result.rows[0] });
  })
);

/**
 * PUT /v1/admin/churches/:churchId/events/:eventId
 * Update church event
 */
adminChurchesRouter.put(
  '/:churchId/events/:eventId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, eventId } = req.params;
    const {
      title,
      description,
      eventDate,
      eventTime,
      endDate,
      endTime,
      location,
      speakerId,
      eventType,
      maxAttendees,
      registrationRequired,
      registrationUrl,
      isPublished,
      isFeatured,
    } = req.body;

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_event SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        event_date = COALESCE($3, event_date),
        event_time = COALESCE($4, event_time),
        end_date = COALESCE($5, end_date),
        end_time = COALESCE($6, end_time),
        location = COALESCE($7, location),
        speaker_id = COALESCE($8, speaker_id),
        event_type = COALESCE($9, event_type),
        max_attendees = COALESCE($10, max_attendees),
        registration_required = COALESCE($11, registration_required),
        registration_url = COALESCE($12, registration_url),
        is_published = COALESCE($13, is_published),
        is_featured = COALESCE($14, is_featured),
        updated_at = NOW()
      WHERE id = $15 AND church_id = $16
      RETURNING id, title, event_date as "eventDate", is_published as "isPublished", updated_at as "updatedAt"`,
      [title, description, eventDate, eventTime, endDate, endTime, location,
       speakerId, eventType, maxAttendees, registrationRequired, registrationUrl,
       isPublished, isFeatured, eventId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Event not found',
      });
    }

    res.json({ event: result.rows[0] });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/events/:eventId
 * Delete church event
 */
adminChurchesRouter.delete(
  '/:churchId/events/:eventId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, eventId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_event WHERE id = $1 AND church_id = $2 RETURNING id',
      [eventId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Event not found',
      });
    }

    res.json({ message: 'Event deleted successfully' });
  })
);

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

/**
 * POST /v1/admin/churches/:churchId/projects
 * Create church project
 */
adminChurchesRouter.post(
  '/:churchId/projects',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const {
      title,
      description,
      goalAmount,
      currency = 'USD',
      startDate,
      endDate,
      projectType = 'other',
      isActive = true,
      isFeatured = false,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title and description are required',
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO church_project (
        church_id, title, description, goal_amount, currency, start_date, end_date,
        project_type, is_active, is_featured, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, goal_amount as "goalAmount", is_active as "isActive", created_at as "createdAt"`,
      [churchId, title, description, goalAmount, currency, startDate, endDate,
       projectType, isActive, isFeatured, req.admin!.id]
    );

    res.status(201).json({ project: result.rows[0] });
  })
);

/**
 * PUT /v1/admin/churches/:churchId/projects/:projectId
 * Update church project
 */
adminChurchesRouter.put(
  '/:churchId/projects/:projectId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, projectId } = req.params;
    const {
      title,
      description,
      goalAmount,
      startDate,
      endDate,
      projectType,
      isActive,
      isFeatured,
    } = req.body;

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_project SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        goal_amount = COALESCE($3, goal_amount),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        project_type = COALESCE($6, project_type),
        is_active = COALESCE($7, is_active),
        is_featured = COALESCE($8, is_featured),
        updated_at = NOW()
      WHERE id = $9 AND church_id = $10
      RETURNING id, title, goal_amount as "goalAmount", is_active as "isActive", updated_at as "updatedAt"`,
      [title, description, goalAmount, startDate, endDate, projectType,
       isActive, isFeatured, projectId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    res.json({ project: result.rows[0] });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/projects/:projectId
 * Delete church project
 */
adminChurchesRouter.delete(
  '/:churchId/projects/:projectId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, projectId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_project WHERE id = $1 AND church_id = $2 RETURNING id',
      [projectId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Project not found',
      });
    }

    res.json({ message: 'Project deleted successfully' });
  })
);

// ============================================================================
// ANNOUNCEMENT MANAGEMENT
// ============================================================================

/**
 * POST /v1/admin/churches/:churchId/announcements
 * Create church announcement
 */
adminChurchesRouter.post(
  '/:churchId/announcements',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const {
      title,
      content,
      priority = 'normal',
      expiresAt,
      isPublished = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Title and content are required',
      });
    }

    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO church_announcement (
        church_id, title, content, priority, expires_at, is_published, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, title, priority, is_published as "isPublished", created_at as "createdAt"`,
      [churchId, title, content, priority, expiresAt, isPublished, req.admin!.id]
    );

    res.status(201).json({ announcement: result.rows[0] });
  })
);

/**
 * PUT /v1/admin/churches/:churchId/announcements/:announcementId
 * Update church announcement
 */
adminChurchesRouter.put(
  '/:churchId/announcements/:announcementId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, announcementId } = req.params;
    const { title, content, priority, expiresAt, isPublished } = req.body;

    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_announcement SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        priority = COALESCE($3, priority),
        expires_at = COALESCE($4, expires_at),
        is_published = COALESCE($5, is_published),
        updated_at = NOW()
      WHERE id = $6 AND church_id = $7
      RETURNING id, title, priority, is_published as "isPublished", updated_at as "updatedAt"`,
      [title, content, priority, expiresAt, isPublished, announcementId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Announcement not found',
      });
    }

    res.json({ announcement: result.rows[0] });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/announcements/:announcementId
 * Delete church announcement
 */
adminChurchesRouter.delete(
  '/:churchId/announcements/:announcementId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, announcementId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_announcement WHERE id = $1 AND church_id = $2 RETURNING id',
      [announcementId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Announcement not found',
      });
    }

    res.json({ message: 'Announcement deleted successfully' });
  })
);

// ============================================================================
// INVITATION CODE MANAGEMENT
// ============================================================================

/**
 * POST /v1/admin/churches/:churchId/invitations
 * Create invitation code
 */
adminChurchesRouter.post(
  '/:churchId/invitations',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { code, maxUses, expiresAt } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invitation code is required',
      });
    }

    const pool = getPool();

    // Check if code already exists
    const existing = await pool.query(
      'SELECT id FROM church_invitation WHERE code = $1',
      [code]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invitation code already exists',
      });
    }

    const result = await pool.query(
      `INSERT INTO church_invitation (
        church_id, code, created_by, max_uses, expires_at
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, code, max_uses as "maxUses", expires_at as "expiresAt", created_at as "createdAt"`,
      [churchId, code, req.admin!.id, maxUses, expiresAt]
    );

    res.status(201).json({ invitation: result.rows[0] });
  })
);

/**
 * GET /v1/admin/churches/:churchId/invitations
 * List invitation codes
 */
adminChurchesRouter.get(
  '/:churchId/invitations',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `SELECT
        id,
        code,
        max_uses as "maxUses",
        uses_count as "usesCount",
        expires_at as "expiresAt",
        is_active as "isActive",
        created_at as "createdAt"
      FROM church_invitation
      WHERE church_id = $1
      ORDER BY created_at DESC`,
      [churchId]
    );

    res.json({ invitations: result.rows });
  })
);

/**
 * DELETE /v1/admin/churches/:churchId/invitations/:invitationId
 * Deactivate invitation code
 */
adminChurchesRouter.delete(
  '/:churchId/invitations/:invitationId',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId, invitationId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `UPDATE church_invitation
       SET is_active = false
       WHERE id = $1 AND church_id = $2
       RETURNING id`,
      [invitationId, churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Invitation not found',
      });
    }

    res.json({ message: 'Invitation deactivated successfully' });
  })
);
