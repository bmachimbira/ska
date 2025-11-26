/**
 * Devotionals Routes
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

const CreateDevotionalSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200),
  author: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  bodyMd: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  contentType: z.enum(['text', 'audio', 'video']).default('text'),
  audioAsset: z.string().uuid().nullish(),
  videoAsset: z.string().uuid().nullish(),
  lang: z.string().default('en'),
});

const UpdateDevotionalSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  slug: z.string().min(1).max(200).optional(),
  author: z.string().nullish(),
  speakerId: z.number().int().positive().nullish(),
  bodyMd: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  contentType: z.enum(['text', 'audio', 'video']).optional(),
  audioAsset: z.string().uuid().nullish(),
  videoAsset: z.string().uuid().nullish(),
  lang: z.string().optional(),
});

export const devotionalsRouter = Router();

devotionalsRouter.get(
  '/today',
  asyncHandler(async (req: Request, res: Response) => {
    const { tz = 'UTC' } = req.query;
    const pool = getPool();

    // Get today's date in the specified timezone
    const query = `
      SELECT 
        d.id,
        d.slug,
        d.title,
        d.author,
        d.speaker_id,
        d.body_md,
        d.date,
        d.content_type,
        d.audio_asset,
        d.video_asset,
        d.lang,
        d.view_count,
        d.created_at,
        d.updated_at,
        json_build_object(
          'id', s.id,
          'name', s.name
        ) as speaker
      FROM devotional d
      LEFT JOIN speaker s ON d.speaker_id = s.id
      WHERE d.date = CURRENT_DATE
      AND d.lang = 'en'
      ORDER BY d.date DESC
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No devotional found for today' });
      return;
    }

    res.json(result.rows[0]);
  })
);

devotionalsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { date, page = '1', limit = '30', lang = 'en' } = req.query;
    const pool = getPool();
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const conditions: string[] = ['lang = $1'];
    const params: any[] = [lang];
    let paramIndex = 2;

    if (date) {
      conditions.push(`date = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM devotional ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get devotionals
    const query = `
      SELECT 
        d.id,
        d.slug,
        d.title,
        d.author,
        d.speaker_id,
        d.body_md,
        d.date,
        d.content_type,
        d.audio_asset,
        d.video_asset,
        d.lang,
        d.view_count,
        d.created_at,
        d.updated_at,
        json_build_object(
          'id', s.id,
          'name', s.name
        ) as speaker
      FROM devotional d
      LEFT JOIN speaker s ON d.speaker_id = s.id
      ${whereClause.replace(/devotional/g, 'd')}
      ORDER BY d.date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const result = await pool.query(query, [...params, limitNum, offset]);

    res.json({
      devotionals: result.rows,
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
 * GET /v1/devotionals/:id
 * Get a specific devotional by ID
 */
devotionalsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT 
        d.id,
        d.slug,
        d.title,
        d.author,
        d.speaker_id,
        d.body_md,
        d.date,
        d.content_type,
        d.audio_asset,
        d.video_asset,
        d.lang,
        d.view_count,
        d.created_at,
        d.updated_at,
        json_build_object(
          'id', s.id,
          'name', s.name
        ) as speaker
      FROM devotional d
      LEFT JOIN speaker s ON d.speaker_id = s.id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Devotional with id ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/devotionals
 * Create a new devotional
 */
devotionalsRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateDevotionalSchema.parse(req.body);
    const pool = getPool();

    const insertQuery = `
      INSERT INTO devotional (
        title,
        slug,
        author,
        speaker_id,
        body_md,
        date,
        content_type,
        audio_asset,
        video_asset,
        lang,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING id, slug, title, author, speaker_id, body_md, date, content_type, 
                audio_asset, video_asset, lang, view_count, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      validated.title,
      validated.slug,
      validated.author || null,
      validated.speakerId || null,
      validated.bodyMd,
      validated.date,
      validated.contentType,
      validated.audioAsset || null,
      validated.videoAsset || null,
      validated.lang,
    ]);

    res.status(201).json(result.rows[0]);
  })
);

/**
 * PUT /v1/devotionals/:id
 * Update an existing devotional
 */
devotionalsRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateDevotionalSchema.parse(req.body);
    const pool = getPool();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validated.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(validated.title);
    }

    if (validated.slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(validated.slug);
    }

    if (validated.author !== undefined) {
      updates.push(`author = $${paramCount++}`);
      values.push(validated.author);
    }

    if (validated.speakerId !== undefined) {
      updates.push(`speaker_id = $${paramCount++}`);
      values.push(validated.speakerId);
    }

    if (validated.bodyMd !== undefined) {
      updates.push(`body_md = $${paramCount++}`);
      values.push(validated.bodyMd);
    }

    if (validated.date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(validated.date);
    }

    if (validated.contentType !== undefined) {
      updates.push(`content_type = $${paramCount++}`);
      values.push(validated.contentType);
    }

    if (validated.audioAsset !== undefined) {
      updates.push(`audio_asset = $${paramCount++}`);
      values.push(validated.audioAsset);
    }

    if (validated.videoAsset !== undefined) {
      updates.push(`video_asset = $${paramCount++}`);
      values.push(validated.videoAsset);
    }

    if (validated.lang !== undefined) {
      updates.push(`lang = $${paramCount++}`);
      values.push(validated.lang);
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
      UPDATE devotional
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, slug, title, author, speaker_id, body_md, date, content_type,
                audio_asset, video_asset, lang, view_count, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Devotional with id ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * DELETE /v1/devotionals/:id
 * Delete a devotional
 */
devotionalsRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM devotional WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Devotional with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
