/**
 * Devotionals Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

export const devotionalsRouter = Router();

devotionalsRouter.get(
  '/today',
  asyncHandler(async (req: Request, res: Response) => {
    const { tz = 'UTC' } = req.query;
    const pool = getPool();

    // Get today's date in the specified timezone
    const query = `
      SELECT 
        id,
        slug,
        title,
        author,
        body_md,
        date,
        lang,
        view_count,
        created_at,
        updated_at
      FROM devotional
      WHERE date = CURRENT_DATE
      AND lang = 'en'
      ORDER BY date DESC
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
        id,
        slug,
        title,
        author,
        body_md,
        date,
        lang,
        view_count,
        created_at,
        updated_at
      FROM devotional
      ${whereClause}
      ORDER BY date DESC
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
