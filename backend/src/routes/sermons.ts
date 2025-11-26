/**
 * Sermons Routes
 * Handles sermon-related endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

const CreateSermonSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().nullish(),
  transcript: z.string().nullish(),
  scriptureRefs: z.array(z.string()).nullish(),
  speakerId: z.number().int().positive().nullish(),
  seriesId: z.number().int().positive().nullish(),
  videoAsset: z.string().uuid().nullish(),
  audioAsset: z.string().uuid().nullish(),
  thumbnailAsset: z.string().uuid().nullish(),
  publishedAt: z.string().nullish(), // ISO date string
  isFeatured: z.boolean().optional(),
  tags: z.array(z.number().int().positive()).nullish(),
});

const UpdateSermonSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullish(),
  transcript: z.string().nullish(),
  scriptureRefs: z.array(z.string()).nullish(),
  speakerId: z.number().int().positive().nullish(),
  seriesId: z.number().int().positive().nullish(),
  videoAsset: z.string().uuid().nullish(),
  audioAsset: z.string().uuid().nullish(),
  thumbnailAsset: z.string().uuid().nullish(),
  publishedAt: z.string().nullish(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.number().int().positive()).nullish(),
});

export const sermonsRouter = Router();

/**
 * GET /v1/sermons
 * List sermons with optional filtering and pagination
 */
sermonsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      search,
      tag,
      series,
      speaker,
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

    if (search) {
      conditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (speaker) {
      conditions.push(`sp.id = $${paramIndex}`);
      params.push(speaker);
      paramIndex++;
    }

    if (series) {
      conditions.push(`se.id = $${paramIndex}`);
      params.push(series);
      paramIndex++;
    }

    if (tag) {
      conditions.push(`EXISTS (
        SELECT 1 FROM sermon_tag st
        JOIN tag t ON st.tag_id = t.id
        WHERE st.sermon_id = s.id AND t.slug = $${paramIndex}
      )`);
      params.push(tag);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get sermons with relations
    const sermonsQuery = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.scripture_refs,
        s.video_asset,
        s.audio_asset,
        s.thumbnail_asset,
        s.published_at,
        s.is_featured,
        s.view_count,
        s.created_at,
        s.updated_at,
        json_build_object('id', sp.id, 'name', sp.name) as speaker,
        json_build_object('id', se.id, 'title', se.title) as series,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
           FROM sermon_tag st
           JOIN tag t ON st.tag_id = t.id
           WHERE st.sermon_id = s.id),
          '[]'::json
        ) as tags
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      ${whereClause}
      ORDER BY s.published_at DESC NULLS LAST, s.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const sermonsResult = await pool.query(sermonsQuery, [...params, limitNum, offset]);

    res.json({
      sermons: sermonsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      filters: {
        search,
        tag,
        series,
        speaker,
      },
    });
  })
);

/**
 * GET /v1/sermons/:id
 * Get a specific sermon by ID
 */
sermonsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.transcript,
        s.scripture_refs,
        s.speaker_id,
        s.series_id,
        s.video_asset,
        s.audio_asset,
        s.thumbnail_asset,
        s.published_at,
        s.is_featured,
        s.view_count,
        s.created_at,
        s.updated_at,
        json_build_object('id', sp.id, 'name', sp.name, 'bio', sp.bio) as speaker,
        json_build_object('id', se.id, 'title', se.title, 'description', se.description) as series,
        COALESCE(
          (SELECT json_agg(json_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
           FROM sermon_tag st
           JOIN tag t ON st.tag_id = t.id
           WHERE st.sermon_id = s.id),
          '[]'::json
        ) as tags
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      WHERE s.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sermon not found' });
      return;
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/sermons
 * Create a new sermon
 */
sermonsRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateSermonSchema.parse(req.body);
    const pool = getPool();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert sermon
      const insertQuery = `
        INSERT INTO sermon (
          title,
          description,
          transcript,
          scripture_refs,
          speaker_id,
          series_id,
          video_asset,
          audio_asset,
          thumbnail_asset,
          published_at,
          is_featured,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id
      `;

      const result = await client.query(insertQuery, [
        validated.title,
        validated.description || null,
        validated.transcript || null,
        validated.scriptureRefs || null,
        validated.speakerId || null,
        validated.seriesId || null,
        validated.videoAsset || null,
        validated.audioAsset || null,
        validated.thumbnailAsset || null,
        validated.publishedAt || null,
        validated.isFeatured || false,
      ]);

      const sermonId = result.rows[0].id;

      // Insert tags if provided
      if (validated.tags && validated.tags.length > 0) {
        for (const tagId of validated.tags) {
          await client.query(
            'INSERT INTO sermon_tag (sermon_id, tag_id) VALUES ($1, $2)',
            [sermonId, tagId]
          );
        }
      }

      await client.query('COMMIT');

      // Fetch the created sermon
      const createdSermon = await pool.query(
        `SELECT 
          s.id,
          s.title,
          s.description,
          s.transcript,
          s.scripture_refs,
          s.speaker_id,
          s.series_id,
          s.video_asset,
          s.audio_asset,
          s.thumbnail_asset,
          s.published_at,
          s.is_featured,
          s.view_count,
          s.created_at,
          s.updated_at
        FROM sermon s
        WHERE s.id = $1`,
        [sermonId]
      );

      res.status(201).json(createdSermon.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  })
);

/**
 * PUT /v1/sermons/:id
 * Update an existing sermon
 */
sermonsRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateSermonSchema.parse(req.body);
    const pool = getPool();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

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

      if (validated.transcript !== undefined) {
        updates.push(`transcript = $${paramCount++}`);
        values.push(validated.transcript);
      }

      if (validated.scriptureRefs !== undefined) {
        updates.push(`scripture_refs = $${paramCount++}`);
        values.push(validated.scriptureRefs);
      }

      if (validated.speakerId !== undefined) {
        updates.push(`speaker_id = $${paramCount++}`);
        values.push(validated.speakerId);
      }

      if (validated.seriesId !== undefined) {
        updates.push(`series_id = $${paramCount++}`);
        values.push(validated.seriesId);
      }

      if (validated.videoAsset !== undefined) {
        updates.push(`video_asset = $${paramCount++}`);
        values.push(validated.videoAsset);
      }

      if (validated.audioAsset !== undefined) {
        updates.push(`audio_asset = $${paramCount++}`);
        values.push(validated.audioAsset);
      }

      if (validated.thumbnailAsset !== undefined) {
        updates.push(`thumbnail_asset = $${paramCount++}`);
        values.push(validated.thumbnailAsset);
      }

      if (validated.publishedAt !== undefined) {
        updates.push(`published_at = $${paramCount++}`);
        values.push(validated.publishedAt);
      }

      if (validated.isFeatured !== undefined) {
        updates.push(`is_featured = $${paramCount++}`);
        values.push(validated.isFeatured);
      }

      if (updates.length === 0 && !validated.tags) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No fields to update',
        });
      }

      if (updates.length > 0) {
        updates.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
          UPDATE sermon
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING id
        `;

        const result = await client.query(updateQuery, values);

        if (result.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            error: 'Not Found',
            message: `Sermon with id ${id} not found`,
          });
        }
      }

      // Update tags if provided
      if (validated.tags !== undefined) {
        // Delete existing tags
        await client.query('DELETE FROM sermon_tag WHERE sermon_id = $1', [id]);

        // Insert new tags
        if (validated.tags && validated.tags.length > 0) {
          for (const tagId of validated.tags) {
            await client.query(
              'INSERT INTO sermon_tag (sermon_id, tag_id) VALUES ($1, $2)',
              [id, tagId]
            );
          }
        }
      }

      await client.query('COMMIT');

      // Fetch the updated sermon
      const updatedSermon = await pool.query(
        `SELECT 
          s.id,
          s.title,
          s.description,
          s.transcript,
          s.scripture_refs,
          s.speaker_id,
          s.series_id,
          s.video_asset,
          s.audio_asset,
          s.thumbnail_asset,
          s.published_at,
          s.is_featured,
          s.view_count,
          s.created_at,
          s.updated_at
        FROM sermon s
        WHERE s.id = $1`,
        [id]
      );

      res.json(updatedSermon.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  })
);

/**
 * DELETE /v1/sermons/:id
 * Delete a sermon
 */
sermonsRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM sermon WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Sermon with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
