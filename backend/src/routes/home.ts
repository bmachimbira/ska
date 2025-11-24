/**
 * Home Route
 * GET /v1/home - Featured content and today's highlights
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

export const homeRouter = Router();

/**
 * GET /v1/home
 * Returns featured sermons, today's devotional, and current quarterlies
 */
homeRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const pool = getPool();

    // Get current year and quarter
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed
    const currentQuarter = Math.ceil(currentMonth / 3);

    // Query current quarterlies from database
    const quarterliesResult = await pool.query(
      `
      SELECT
        id,
        kind,
        year,
        quarter,
        title
      FROM quarterly
      WHERE year = $1 AND quarter = $2
      ORDER BY
        CASE kind
          WHEN 'adult' THEN 1
          WHEN 'youth' THEN 2
          WHEN 'kids' THEN 3
          ELSE 4
        END
      `,
      [currentYear, currentQuarter]
    );

    // TODO: Query featured sermons from database
    const featuredSermons = [
      {
        id: 1,
        title: 'The Power of Grace',
        description: "Discover how God's grace transforms our lives.",
        thumbnailUrl: 'https://via.placeholder.com/400x225',
        speaker: {
          id: 1,
          name: 'Pastor John Smith',
        },
        publishedAt: new Date().toISOString(),
      },
    ];

    // TODO: Query today's devotional from database
    const todayDevotional = {
      id: 1,
      title: "God's Unfailing Love",
      author: 'Ellen G. White',
      date: new Date().toISOString().split('T')[0],
      excerpt: "For God so loved the world...",
    };

    const homeData = {
      featuredSermons,
      todayDevotional,
      currentQuarterlies: quarterliesResult.rows.map(row => ({
        id: row.id,
        kind: row.kind,
        title: row.title,
        year: row.year,
        quarter: row.quarter,
      })),
    };

    res.json(homeData);
  })
);
