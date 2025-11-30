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

    // Query featured sermon from database
    const featuredSermonResult = await pool.query(
      `
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
        s.video_asset,
        s.audio_asset,
        s.thumbnail_asset,
        CASE WHEN sp.id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name,
            'bio', sp.bio
          )
        ELSE NULL END as speaker,
        CASE WHEN se.id IS NOT NULL THEN
          json_build_object(
            'id', se.id,
            'title', se.title,
            'description', se.description
          )
        ELSE NULL END as series
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      WHERE s.is_featured = true
      AND s.published_at IS NOT NULL
      ORDER BY s.published_at DESC
      LIMIT 1
      `
    );

    // Query recent sermons from database
    const recentSermonsResult = await pool.query(
      `
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
        s.video_asset,
        s.audio_asset,
        s.thumbnail_asset,
        CASE WHEN sp.id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name,
            'bio', sp.bio
          )
        ELSE NULL END as speaker,
        CASE WHEN se.id IS NOT NULL THEN
          json_build_object(
            'id', se.id,
            'title', se.title,
            'description', se.description
          )
        ELSE NULL END as series
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      WHERE s.published_at IS NOT NULL
      ORDER BY s.published_at DESC
      LIMIT 6
      `
    );

    // Query today's devotional from database
    const todayDevotionalResult = await pool.query(
      `
      SELECT
        d.id,
        d.slug,
        d.title,
        d.author,
        d.body_md as content,
        d.date,
        d.lang,
        d.view_count,
        d.created_at,
        d.updated_at,
        d.audio_asset
      FROM devotional d
      WHERE d.date = CURRENT_DATE
      AND d.lang = 'en'
      LIMIT 1
      `
    );

    // Query next upcoming event
    const nextEventResult = await pool.query(
      `
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
        CASE WHEN sp.id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name
          )
        ELSE NULL END as speaker
      FROM event e
      LEFT JOIN speaker sp ON e.speaker_id = sp.id
      WHERE e.is_published = true AND e.event_date >= NOW()
      ORDER BY e.event_date ASC
      LIMIT 1
      `
    );

    // Query active causes/projects
    const activeCausesResult = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        goal_amount,
        raised_amount,
        thumbnail_asset,
        start_date,
        end_date,
        is_active,
        is_featured,
        created_at,
        updated_at
      FROM cause
      WHERE is_active = true
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 3
      `
    );

    const featuredSermon = featuredSermonResult.rows[0] || null;
    const recentSermons = recentSermonsResult.rows || [];
    const todayDevotional = todayDevotionalResult.rows[0] || null;
    const nextEvent = nextEventResult.rows[0] || null;
    const activeCauses = activeCausesResult.rows || [];

    const homeData = {
      featuredSermon,
      recentSermons,
      todayDevotional,
      nextEvent,
      activeCauses,
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
