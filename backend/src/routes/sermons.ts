/**
 * Sermons Routes
 * Handles sermon-related endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

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
        s.scripture_refs,
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
