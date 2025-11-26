/**
 * Stats Routes
 * Provides dashboard statistics
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

export const statsRouter = Router();

/**
 * GET /v1/stats
 * Get dashboard statistics
 */
statsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const pool = getPool();

    // Get sermon count
    const sermonCountResult = await pool.query('SELECT COUNT(*) as count FROM sermon');
    const sermonCount = parseInt(sermonCountResult.rows[0].count);

    // Get devotional count
    const devotionalCountResult = await pool.query('SELECT COUNT(*) as count FROM devotional');
    const devotionalCount = parseInt(devotionalCountResult.rows[0].count);

    // Get quarterly count
    const quarterlyCountResult = await pool.query('SELECT COUNT(*) as count FROM quarterly');
    const quarterlyCount = parseInt(quarterlyCountResult.rows[0].count);

    // Get total views (sum of sermon and devotional views)
    const viewsResult = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(view_count), 0) FROM sermon) +
        (SELECT COALESCE(SUM(view_count), 0) FROM devotional) as total_views
    `);
    const totalViews = parseInt(viewsResult.rows[0].total_views);

    // Get recent sermon stats (last 30 days)
    const recentSermonsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM sermon
      WHERE published_at >= NOW() - INTERVAL '30 days'
    `);
    const recentSermons = parseInt(recentSermonsResult.rows[0].count);

    // Get total sermons before 30 days ago
    const olderSermonsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM sermon
      WHERE published_at < NOW() - INTERVAL '30 days'
    `);
    const olderSermons = parseInt(olderSermonsResult.rows[0].count);

    // Calculate percentage change for sermons
    const sermonChange = olderSermons > 0 
      ? Math.round((recentSermons / olderSermons) * 100) 
      : 100;

    res.json({
      stats: {
        sermons: {
          total: sermonCount,
          change: `+${sermonChange}%`,
          changeType: 'increase',
        },
        devotionals: {
          total: devotionalCount,
        },
        quarterlies: {
          total: quarterlyCount,
        },
        totalViews: {
          total: totalViews,
        },
      },
    });
  })
);
