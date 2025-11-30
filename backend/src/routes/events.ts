/**
 * Events Routes
 * Handles event-related endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

const CreateEventSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  eventDate: z.string(), // ISO date string
  eventTime: z.string().nullish(),
  location: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  thumbnailAsset: z.string().uuid().nullish(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

const UpdateEventSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullish(),
  eventDate: z.string().optional(),
  eventTime: z.string().nullish(),
  location: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  thumbnailAsset: z.string().uuid().nullish(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const eventsRouter = Router();

/**
 * GET /v1/events
 * List events with optional filtering and pagination
 */
eventsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      upcoming = 'true',
      featured,
      page = '1',
      limit = '20',
    } = req.query;

    const pool = getPool();
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause for filtering
    const conditions: string[] = ['e.is_published = true'];
    const params: any[] = [];
    let paramIndex = 1;

    if (upcoming === 'true') {
      conditions.push(`e.event_date >= NOW()`);
    }

    if (featured === 'true') {
      conditions.push(`e.is_featured = true`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event e
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get events with relations
    const eventsQuery = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.thumbnail_asset,
        e.is_featured,
        e.is_published,
        e.created_at,
        e.updated_at,
        json_build_object('id', sp.id, 'name', sp.name) as speaker
      FROM event e
      LEFT JOIN speaker sp ON e.speaker_id = sp.id
      ${whereClause}
      ORDER BY e.event_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const eventsResult = await pool.query(eventsQuery, [...params, limitNum, offset]);

    res.json({
      events: eventsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        upcoming,
        featured,
      },
    });
  })
);

/**
 * GET /v1/events/next
 * Get the next upcoming event
 */
eventsRouter.get(
  '/next',
  asyncHandler(async (req: Request, res: Response) => {
    const pool = getPool();

    const query = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.thumbnail_asset,
        e.is_featured,
        e.created_at,
        e.updated_at,
        json_build_object('id', sp.id, 'name', sp.name) as speaker
      FROM event e
      LEFT JOIN speaker sp ON e.speaker_id = sp.id
      WHERE e.is_published = true AND e.event_date >= NOW()
      ORDER BY e.event_date ASC
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No upcoming events found' });
      return;
    }

    res.json(result.rows[0]);
  })
);

/**
 * GET /v1/events/:id
 * Get a specific event by ID
 */
eventsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.speaker_id,
        e.thumbnail_asset,
        e.is_featured,
        e.is_published,
        e.created_at,
        e.updated_at,
        json_build_object('id', sp.id, 'name', sp.name, 'bio', sp.bio) as speaker
      FROM event e
      LEFT JOIN speaker sp ON e.speaker_id = sp.id
      WHERE e.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/events
 * Create a new event
 */
eventsRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateEventSchema.parse(req.body);
    const pool = getPool();

    const insertQuery = `
      INSERT INTO event (
        title,
        description,
        event_date,
        event_time,
        location,
        speaker_id,
        thumbnail_asset,
        is_featured,
        is_published,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      validated.title,
      validated.description || null,
      validated.eventDate,
      validated.eventTime || null,
      validated.location || null,
      validated.speakerId || null,
      validated.thumbnailAsset || null,
      validated.isFeatured || false,
      validated.isPublished !== undefined ? validated.isPublished : true,
    ]);

    res.status(201).json(result.rows[0]);
  })
);

/**
 * PUT /v1/events/:id
 * Update an existing event
 */
eventsRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateEventSchema.parse(req.body);
    const pool = getPool();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validated.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(validated.title);
    }

    if (validated.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(validated.description);
    }

    if (validated.eventDate !== undefined) {
      updates.push(`event_date = $${paramCount++}`);
      values.push(validated.eventDate);
    }

    if (validated.eventTime !== undefined) {
      updates.push(`event_time = $${paramCount++}`);
      values.push(validated.eventTime);
    }

    if (validated.location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(validated.location);
    }

    if (validated.speakerId !== undefined) {
      updates.push(`speaker_id = $${paramCount++}`);
      values.push(validated.speakerId);
    }

    if (validated.thumbnailAsset !== undefined) {
      updates.push(`thumbnail_asset = $${paramCount++}`);
      values.push(validated.thumbnailAsset);
    }

    if (validated.isFeatured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      values.push(validated.isFeatured);
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
      UPDATE event
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Event with id ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * DELETE /v1/events/:id
 * Delete an event
 */
eventsRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM event WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Event with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
