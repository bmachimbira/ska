/**
 * Announcements Routes
 * Handles announcement-related endpoints for both church-specific and global announcements
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  scope: z.enum(['church', 'global']),
  churchId: z.number().int().positive().nullish(),
  expiresAt: z.string().nullish(), // ISO date string
  isPublished: z.boolean().optional(),
});

const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  scope: z.enum(['church', 'global']).optional(),
  churchId: z.number().int().positive().nullish(),
  expiresAt: z.string().nullish(),
  isPublished: z.boolean().optional(),
});

export const announcementsRouter = Router();

/**
 * GET /v1/announcements
 * List announcements with optional filtering and pagination
 */
announcementsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      scope,
      churchId,
      priority,
      includeExpired = 'false',
      page = '1',
      limit = '20',
    } = req.query;

    const pool = getPool();
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause for filtering
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Only show published announcements by default
    conditions.push('a.is_published = TRUE');

    if (scope) {
      conditions.push(`a.scope = $${paramIndex}`);
      params.push(scope);
      paramIndex++;
    }

    if (churchId) {
      conditions.push(`a.church_id = $${paramIndex}`);
      params.push(churchId);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`a.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    // Filter out expired announcements unless explicitly requested
    if (includeExpired === 'false') {
      conditions.push(`(a.expires_at IS NULL OR a.expires_at > NOW())`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM church_announcement a
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get announcements with relations
    const announcementsQuery = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.priority,
        a.scope,
        a.expires_at as "expiresAt",
        a.is_published as "isPublished",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        CASE WHEN c.id IS NOT NULL THEN
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
          )
        ELSE NULL END as church,
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          )
        ELSE NULL END as "createdBy"
      FROM church_announcement a
      LEFT JOIN church c ON a.church_id = c.id
      LEFT JOIN app_user u ON a.created_by = u.id
      ${whereClause}
      ORDER BY 
        CASE a.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const announcementsResult = await pool.query(announcementsQuery, [...params, limitNum, offset]);

    res.json({
      announcements: announcementsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        scope,
        churchId,
        priority,
        includeExpired,
      },
    });
  })
);

/**
 * GET /v1/announcements/:id
 * Get a specific announcement by ID
 */
announcementsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.priority,
        a.scope,
        a.expires_at as "expiresAt",
        a.is_published as "isPublished",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        CASE WHEN c.id IS NOT NULL THEN
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'description', c.description
          )
        ELSE NULL END as church,
        CASE WHEN u.id IS NOT NULL THEN
          json_build_object(
            'id', u.id,
            'name', u.name,
            'email', u.email
          )
        ELSE NULL END as "createdBy"
      FROM church_announcement a
      LEFT JOIN church c ON a.church_id = c.id
      LEFT JOIN app_user u ON a.created_by = u.id
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Announcement not found' });
      return;
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/announcements
 * Create a new announcement
 */
announcementsRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateAnnouncementSchema.parse(req.body);
    const pool = getPool();

    // Validate scope and churchId consistency
    if (validated.scope === 'global' && validated.churchId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Global announcements cannot have a churchId',
      });
      return;
    }

    if (validated.scope === 'church' && !validated.churchId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Church announcements must have a churchId',
      });
      return;
    }

    // Insert announcement
    const insertQuery = `
      INSERT INTO church_announcement (
        title,
        content,
        priority,
        scope,
        church_id,
        expires_at,
        is_published,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      validated.title,
      validated.content,
      validated.priority || 'normal',
      validated.scope,
      validated.churchId || null,
      validated.expiresAt || null,
      validated.isPublished || false,
    ]);

    const announcementId = result.rows[0].id;

    // Fetch the created announcement
    const createdAnnouncement = await pool.query(
      `SELECT 
        a.id,
        a.title,
        a.content,
        a.priority,
        a.scope,
        a.church_id as "churchId",
        a.expires_at as "expiresAt",
        a.is_published as "isPublished",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM church_announcement a
      WHERE a.id = $1`,
      [announcementId]
    );

    res.status(201).json(createdAnnouncement.rows[0]);
  })
);

/**
 * PUT /v1/announcements/:id
 * Update an existing announcement
 */
announcementsRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateAnnouncementSchema.parse(req.body);
    const pool = getPool();

    // Validate scope and churchId consistency if being updated
    if (validated.scope === 'global' && validated.churchId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Global announcements cannot have a churchId',
      });
      return;
    }

    if (validated.scope === 'church' && validated.churchId === null) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Church announcements must have a churchId',
      });
      return;
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validated.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(validated.title);
    }

    if (validated.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(validated.content);
    }

    if (validated.priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(validated.priority);
    }

    if (validated.scope !== undefined) {
      updates.push(`scope = $${paramCount++}`);
      values.push(validated.scope);
    }

    if (validated.churchId !== undefined) {
      updates.push(`church_id = $${paramCount++}`);
      values.push(validated.churchId);
    }

    if (validated.expiresAt !== undefined) {
      updates.push(`expires_at = $${paramCount++}`);
      values.push(validated.expiresAt);
    }

    if (validated.isPublished !== undefined) {
      updates.push(`is_published = $${paramCount++}`);
      values.push(validated.isPublished);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
      UPDATE church_announcement
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Announcement with id ${id} not found`,
      });
    }

    // Fetch the updated announcement
    const updatedAnnouncement = await pool.query(
      `SELECT 
        a.id,
        a.title,
        a.content,
        a.priority,
        a.scope,
        a.church_id as "churchId",
        a.expires_at as "expiresAt",
        a.is_published as "isPublished",
        a.created_at as "createdAt",
        a.updated_at as "updatedAt"
      FROM church_announcement a
      WHERE a.id = $1`,
      [id]
    );

    res.json(updatedAnnouncement.rows[0]);
  })
);

/**
 * DELETE /v1/announcements/:id
 * Delete an announcement
 */
announcementsRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM church_announcement WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Announcement with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
