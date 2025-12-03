/**
 * Series Routes
 * Handles sermon series CRUD operations
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

export const seriesRouter = Router();

const CreateSeriesSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  heroImage: z.string().uuid().nullish(),
});

const UpdateSeriesSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  heroImage: z.string().uuid().nullish(),
});

/**
 * GET /v1/series
 * List all series with optional filters
 */
seriesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', limit = '50', search, speakerId } = req.query;
    const pool = getPool();

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (speakerId) {
      conditions.push(`s.speaker_id = $${paramIndex}`);
      params.push(parseInt(speakerId as string));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM series s ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get series with sermon count
    const query = `
      SELECT
        s.id,
        s.title,
        s.description,
        s.speaker_id,
        s.hero_image,
        s.created_at,
        s.updated_at,
        CAST(COUNT(DISTINCT ser.id) AS INTEGER) as sermon_count,
        CASE WHEN s.speaker_id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name,
            'bio', sp.bio,
            'photoUrl', CASE WHEN sp_photo.id IS NOT NULL THEN sp_photo.hls_url ELSE NULL END
          )
        END as speaker,
        CASE WHEN s.hero_image IS NOT NULL THEN
          json_build_object(
            'id', ma.id,
            'kind', ma.kind,
            'hls_url', ma.hls_url,
            'download_url', ma.download_url
          )
        END as hero_image_details
      FROM series s
      LEFT JOIN sermon ser ON s.id = ser.series_id
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN media_asset sp_photo ON sp.photo_asset = sp_photo.id
      LEFT JOIN media_asset ma ON s.hero_image = ma.id
      ${whereClause}
      GROUP BY s.id, s.title, s.description, s.speaker_id, s.hero_image, s.created_at, s.updated_at,
               sp.id, sp.name, sp.bio,
               sp_photo.id, sp_photo.hls_url,
               ma.id, ma.kind, ma.hls_url, ma.download_url
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, [...params, limitNum, offset]);

    res.json({
      series: result.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  })
);

/**
 * GET /v1/series/:id
 * Get a single series by ID
 */
seriesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT
        s.id,
        s.title,
        s.description,
        s.speaker_id,
        s.hero_image,
        s.created_at,
        s.updated_at,
        CAST(COUNT(DISTINCT ser.id) AS INTEGER) as sermon_count,
        CASE WHEN s.speaker_id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name,
            'bio', sp.bio,
            'photoUrl', CASE WHEN sp_photo.id IS NOT NULL THEN sp_photo.hls_url ELSE NULL END
          )
        END as speaker,
        CASE WHEN s.hero_image IS NOT NULL THEN
          json_build_object(
            'id', ma.id,
            'kind', ma.kind,
            'hls_url', ma.hls_url,
            'download_url', ma.download_url
          )
        END as hero_image_details
      FROM series s
      LEFT JOIN sermon ser ON s.id = ser.series_id
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN media_asset sp_photo ON sp.photo_asset = sp_photo.id
      LEFT JOIN media_asset ma ON s.hero_image = ma.id
      WHERE s.id = $1
      GROUP BY s.id, s.title, s.description, s.speaker_id, s.hero_image, s.created_at, s.updated_at,
               sp.id, sp.name, sp.bio,
               sp_photo.id, sp_photo.hls_url,
               ma.id, ma.kind, ma.hls_url, ma.download_url
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Series with ID ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/series
 * Create a new series
 */
seriesRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateSeriesSchema.parse(req.body);
    const pool = getPool();

    const insertQuery = `
      INSERT INTO series (
        title,
        description,
        speaker_id,
        hero_image,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, title, description, speaker_id, hero_image, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      validated.title,
      validated.description || null,
      validated.speakerId || null,
      validated.heroImage || null,
    ]);

    res.status(201).json(result.rows[0]);
  })
);

/**
 * PUT /v1/series/:id
 * Update a series
 */
seriesRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateSeriesSchema.parse(req.body);
    const pool = getPool();

    // Check if series exists
    const checkQuery = 'SELECT id FROM series WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Series with ID ${id} not found`,
      });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (validated.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(validated.title);
    }

    if (validated.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(validated.description || null);
    }

    if (validated.speakerId !== undefined) {
      updates.push(`speaker_id = $${paramIndex++}`);
      params.push(validated.speakerId || null);
    }

    if (validated.heroImage !== undefined) {
      updates.push(`hero_image = $${paramIndex++}`);
      params.push(validated.heroImage || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const updateQuery = `
      UPDATE series
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, speaker_id, hero_image, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, params);

    res.json(result.rows[0]);
  })
);

/**
 * DELETE /v1/series/:id
 * Delete a series
 */
seriesRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    // Check if series has sermons
    const checkQuery = 'SELECT COUNT(*) as count FROM sermon WHERE series_id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    const sermonCount = parseInt(checkResult.rows[0].count);

    if (sermonCount > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Cannot delete series with ${sermonCount} sermon(s). Please reassign or delete the sermons first.`,
      });
    }

    const deleteQuery = 'DELETE FROM series WHERE id = $1 RETURNING id';
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Series with ID ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
