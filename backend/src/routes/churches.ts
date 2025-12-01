/**
 * Church Routes
 * Handles church management, membership, and local content
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';
import { z } from 'zod';

export const churchesRouter = Router();

// ============================================================================
// CHURCH MANAGEMENT
// ============================================================================

/**
 * GET /v1/churches
 * List all churches with optional filters
 */
churchesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { city, country, search, page = 1, limit = 20 } = req.query;
    const pool = getPool();

    let query = `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.city,
        c.state,
        c.country,
        c.latitude,
        c.longitude,
        c.phone,
        c.email,
        c.website,
        c.member_count as "memberCount",
        c.is_active as "isActive",
        CASE WHEN logo.id IS NOT NULL THEN
          json_build_object(
            'id', logo.id,
            'type', logo.kind,
            'url', COALESCE(logo.hls_url, logo.download_url)
          )
        ELSE NULL END as "logoAsset"
      FROM church c
      LEFT JOIN media_asset logo ON c.logo_asset = logo.id
      WHERE c.is_active = true
    `;
    
    const params: any[] = [];

    if (city) {
      params.push(city);
      query += ` AND c.city ILIKE $${params.length}`;
    }

    if (country) {
      params.push(country);
      query += ` AND c.country ILIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.city ILIKE $${params.length})`;
    }

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM (${query}) as filtered`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY c.member_count DESC, c.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      churches: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

/**
 * GET /v1/churches/:slug
 * Get a single church by slug
 */
churchesRouter.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.address,
        c.city,
        c.state,
        c.country,
        c.postal_code as "postalCode",
        c.latitude,
        c.longitude,
        c.phone,
        c.email,
        c.website,
        c.timezone,
        c.member_count as "memberCount",
        c.is_active as "isActive",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        CASE WHEN logo.id IS NOT NULL THEN
          json_build_object(
            'id', logo.id,
            'type', logo.kind,
            'url', COALESCE(logo.hls_url, logo.download_url)
          )
        ELSE NULL END as "logoAsset",
        CASE WHEN cover.id IS NOT NULL THEN
          json_build_object(
            'id', cover.id,
            'type', cover.kind,
            'url', COALESCE(cover.hls_url, cover.download_url)
          )
        ELSE NULL END as "coverAsset"
      FROM church c
      LEFT JOIN media_asset logo ON c.logo_asset = logo.id
      LEFT JOIN media_asset cover ON c.cover_asset = cover.id
      WHERE c.slug = $1 AND c.is_active = true
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Church with slug ${slug} not found`,
      });
    }

    res.json({ church: result.rows[0] });
  })
);

/**
 * POST /v1/churches/:churchId/join
 * Join a church (with optional invitation code)
 */
churchesRouter.post(
  '/:churchId/join',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { userId, invitationCode } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId is required',
      });
    }

    const pool = getPool();

    // Verify church exists
    const churchResult = await pool.query(
      'SELECT id FROM church WHERE id = $1 AND is_active = true',
      [churchId]
    );

    if (churchResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Church not found',
      });
    }

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT id FROM church_member WHERE user_id = $1 AND church_id = $2',
      [userId, churchId]
    );

    if (existingMember.rows.length > 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Already a member of this church',
      });
    }

    // Verify invitation code if provided
    if (invitationCode) {
      const inviteResult = await pool.query(
        `SELECT id, max_uses, uses_count FROM church_invitation 
         WHERE code = $1 AND church_id = $2 AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [invitationCode, churchId]
      );

      if (inviteResult.rows.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid or expired invitation code',
        });
      }

      const invite = inviteResult.rows[0];
      if (invite.max_uses && invite.uses_count >= invite.max_uses) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invitation code has reached maximum uses',
        });
      }
    }

    // Check if user has a primary church
    const userResult = await pool.query(
      'SELECT primary_church_id FROM app_user WHERE id = $1',
      [userId]
    );

    const isPrimary = !userResult.rows[0]?.primary_church_id;

    // Add membership
    const memberResult = await pool.query(
      `INSERT INTO church_member (user_id, church_id, role, is_primary)
       VALUES ($1, $2, 'member', $3)
       RETURNING id, user_id as "userId", church_id as "churchId", role, is_primary as "isPrimary", joined_at as "joinedAt"`,
      [userId, churchId, isPrimary]
    );

    // Update user's primary church if this is their first
    if (isPrimary) {
      await pool.query(
        'UPDATE app_user SET primary_church_id = $1 WHERE id = $2',
        [churchId, userId]
      );
    }

    res.json({ membership: memberResult.rows[0] });
  })
);

// ============================================================================
// CHURCH DEVOTIONALS
// ============================================================================

/**
 * GET /v1/churches/:churchId/devotionals
 * Get devotionals for a specific church
 */
churchesRouter.get(
  '/:churchId/devotionals',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pool = getPool();

    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `
      SELECT
        cd.id,
        cd.church_id as "churchId",
        cd.title,
        cd.body_md as "bodyMd",
        cd.scripture_refs as "scriptureRefs",
        cd.date,
        cd.is_published as "isPublished",
        cd.view_count as "viewCount",
        cd.created_at as "createdAt",
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as author,
        CASE WHEN aud.id IS NOT NULL THEN
          json_build_object(
            'id', aud.id,
            'type', aud.kind,
            'url', COALESCE(aud.download_url, aud.hls_url),
            'duration', aud.duration_seconds
          )
        ELSE NULL END as "audioAsset"
      FROM church_devotional cd
      JOIN app_user u ON cd.author_id = u.id
      LEFT JOIN media_asset aud ON cd.audio_asset = aud.id
      WHERE cd.church_id = $1 AND cd.is_published = true
      ORDER BY cd.date DESC
      LIMIT $2 OFFSET $3
      `,
      [churchId, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM church_devotional WHERE church_id = $1 AND is_published = true',
      [churchId]
    );

    res.json({
      devotionals: result.rows,
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
 * GET /v1/churches/:churchId/devotionals/today
 * Get today's devotional for a church
 */
churchesRouter.get(
  '/:churchId/devotionals/today',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        cd.id,
        cd.church_id as "churchId",
        cd.title,
        cd.body_md as "bodyMd",
        cd.scripture_refs as "scriptureRefs",
        cd.date,
        cd.view_count as "viewCount",
        json_build_object(
          'id', u.id,
          'name', u.name
        ) as author,
        CASE WHEN aud.id IS NOT NULL THEN
          json_build_object(
            'id', aud.id,
            'type', aud.kind,
            'url', COALESCE(aud.download_url, aud.hls_url),
            'duration', aud.duration_seconds
          )
        ELSE NULL END as "audioAsset"
      FROM church_devotional cd
      JOIN app_user u ON cd.author_id = u.id
      LEFT JOIN media_asset aud ON cd.audio_asset = aud.id
      WHERE cd.church_id = $1 AND cd.date = CURRENT_DATE AND cd.is_published = true
      LIMIT 1
      `,
      [churchId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No devotional found for today',
      });
    }

    res.json({ devotional: result.rows[0] });
  })
);

// ============================================================================
// CHURCH EVENTS
// ============================================================================

/**
 * GET /v1/churches/:churchId/events
 * Get events for a specific church
 */
churchesRouter.get(
  '/:churchId/events',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { upcoming = 'true', page = 1, limit = 20 } = req.query;
    const pool = getPool();

    const offset = (Number(page) - 1) * Number(limit);
    const isUpcoming = upcoming === 'true';

    let query = `
      SELECT
        ce.id,
        ce.church_id as "churchId",
        ce.title,
        ce.description,
        ce.event_date as "eventDate",
        ce.event_time as "eventTime",
        ce.end_date as "endDate",
        ce.end_time as "endTime",
        ce.location,
        ce.event_type as "eventType",
        ce.max_attendees as "maxAttendees",
        ce.registration_required as "registrationRequired",
        ce.registration_url as "registrationUrl",
        ce.is_featured as "isFeatured",
        ce.created_at as "createdAt",
        CASE WHEN sp.id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name
          )
        ELSE NULL END as speaker,
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset",
        (SELECT COUNT(*) FROM event_registration WHERE event_id = ce.id AND status != 'cancelled') as "attendeeCount"
      FROM church_event ce
      LEFT JOIN speaker sp ON ce.speaker_id = sp.id
      LEFT JOIN media_asset thumb ON ce.thumbnail_asset = thumb.id
      WHERE ce.church_id = $1 AND ce.is_published = true
    `;

    const params: any[] = [churchId];

    if (isUpcoming) {
      query += ` AND ce.event_date >= CURRENT_DATE`;
      query += ` ORDER BY ce.event_date ASC, ce.event_time ASC`;
    } else {
      query += ` AND ce.event_date < CURRENT_DATE`;
      query += ` ORDER BY ce.event_date DESC, ce.event_time DESC`;
    }

    query += ` LIMIT $2 OFFSET $3`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({ events: result.rows });
  })
);

// ============================================================================
// CHURCH PROJECTS
// ============================================================================

/**
 * GET /v1/churches/:churchId/projects
 * Get projects for a specific church
 */
churchesRouter.get(
  '/:churchId/projects',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { active = 'true' } = req.query;
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        cp.id,
        cp.church_id as "churchId",
        cp.title,
        cp.description,
        cp.goal_amount as "goalAmount",
        cp.raised_amount as "raisedAmount",
        cp.currency,
        cp.start_date as "startDate",
        cp.end_date as "endDate",
        cp.project_type as "projectType",
        cp.is_active as "isActive",
        cp.is_featured as "isFeatured",
        cp.created_at as "createdAt",
        CASE WHEN cp.goal_amount > 0 THEN
          ROUND((cp.raised_amount / cp.goal_amount * 100)::numeric, 2)
        ELSE 0 END as "progressPercentage",
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset"
      FROM church_project cp
      LEFT JOIN media_asset thumb ON cp.thumbnail_asset = thumb.id
      WHERE cp.church_id = $1 AND cp.is_active = $2
      ORDER BY cp.is_featured DESC, cp.created_at DESC
      `,
      [churchId, active === 'true']
    );

    res.json({ projects: result.rows });
  })
);

/**
 * GET /v1/churches/:churchId/home
 * Get church home page data (for members)
 */
churchesRouter.get(
  '/:churchId/home',
  asyncHandler(async (req: Request, res: Response) => {
    const { churchId } = req.params;
    const { userId } = req.query;
    const pool = getPool();

    if (!userId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId is required',
      });
    }

    // Get church details
    const churchResult = await pool.query(
      `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.city,
        c.country,
        c.member_count as "memberCount",
        CASE WHEN logo.id IS NOT NULL THEN
          json_build_object(
            'id', logo.id,
            'type', logo.kind,
            'url', COALESCE(logo.hls_url, logo.download_url)
          )
        ELSE NULL END as "logoAsset"
      FROM church c
      LEFT JOIN media_asset logo ON c.logo_asset = logo.id
      WHERE c.id = $1 AND c.is_active = true
      `,
      [churchId]
    );

    if (churchResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Church not found',
      });
    }

    // Get membership
    const membershipResult = await pool.query(
      `SELECT id, role, is_primary as "isPrimary", joined_at as "joinedAt"
       FROM church_member
       WHERE user_id = $1 AND church_id = $2`,
      [userId, churchId]
    );

    if (membershipResult.rows.length === 0) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Not a member of this church',
      });
    }

    // Get today's devotional
    const devotionalResult = await pool.query(
      `
      SELECT cd.id, cd.title, cd.date,
        json_build_object('id', u.id, 'name', u.name) as author
      FROM church_devotional cd
      JOIN app_user u ON cd.author_id = u.id
      WHERE cd.church_id = $1 AND cd.date = CURRENT_DATE AND cd.is_published = true
      LIMIT 1
      `,
      [churchId]
    );

    // Get upcoming events
    const eventsResult = await pool.query(
      `
      SELECT ce.id, ce.title, ce.event_date as "eventDate", ce.event_time as "eventTime", ce.location
      FROM church_event ce
      WHERE ce.church_id = $1 AND ce.is_published = true AND ce.event_date >= CURRENT_DATE
      ORDER BY ce.event_date ASC, ce.event_time ASC
      LIMIT 5
      `,
      [churchId]
    );

    // Get active projects
    const projectsResult = await pool.query(
      `
      SELECT cp.id, cp.title, cp.goal_amount as "goalAmount", cp.raised_amount as "raisedAmount", cp.currency
      FROM church_project cp
      WHERE cp.church_id = $1 AND cp.is_active = true
      ORDER BY cp.is_featured DESC, cp.created_at DESC
      LIMIT 3
      `,
      [churchId]
    );

    // Get announcements
    const announcementsResult = await pool.query(
      `
      SELECT ca.id, ca.title, ca.content, ca.priority, ca.created_at as "createdAt"
      FROM church_announcement ca
      WHERE ca.church_id = $1 AND ca.is_published = true
        AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
      ORDER BY ca.priority DESC, ca.created_at DESC
      LIMIT 5
      `,
      [churchId]
    );

    res.json({
      church: churchResult.rows[0],
      membership: membershipResult.rows[0],
      todayDevotional: devotionalResult.rows[0] || null,
      upcomingEvents: eventsResult.rows,
      activeProjects: projectsResult.rows,
      announcements: announcementsResult.rows,
    });
  })
);
