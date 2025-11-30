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
        s.scripture_refs as "scriptureRefs",
        s.published_at as "publishedAt",
        s.is_featured as "isFeatured",
        s.view_count as "viewCount",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
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
        ELSE NULL END as series,
        CASE WHEN vid.id IS NOT NULL THEN
          json_build_object(
            'id', vid.id,
            'type', vid.kind,
            'url', COALESCE(vid.hls_url, vid.download_url),
            'duration', vid.duration_seconds
          )
        ELSE NULL END as "videoAsset",
        CASE WHEN aud.id IS NOT NULL THEN
          json_build_object(
            'id', aud.id,
            'type', aud.kind,
            'url', COALESCE(aud.download_url, aud.hls_url),
            'duration', aud.duration_seconds
          )
        ELSE NULL END as "audioAsset",
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset"
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      LEFT JOIN media_asset vid ON s.video_asset = vid.id
      LEFT JOIN media_asset aud ON s.audio_asset = aud.id
      LEFT JOIN media_asset thumb ON s.thumbnail_asset = thumb.id
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
        s.scripture_refs as "scriptureRefs",
        s.published_at as "publishedAt",
        s.is_featured as "isFeatured",
        s.view_count as "viewCount",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
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
        ELSE NULL END as series,
        CASE WHEN vid.id IS NOT NULL THEN
          json_build_object(
            'id', vid.id,
            'type', vid.kind,
            'url', COALESCE(vid.hls_url, vid.download_url),
            'duration', vid.duration_seconds
          )
        ELSE NULL END as "videoAsset",
        CASE WHEN aud.id IS NOT NULL THEN
          json_build_object(
            'id', aud.id,
            'type', aud.kind,
            'url', COALESCE(aud.download_url, aud.hls_url),
            'duration', aud.duration_seconds
          )
        ELSE NULL END as "audioAsset",
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset"
      FROM sermon s
      LEFT JOIN speaker sp ON s.speaker_id = sp.id
      LEFT JOIN series se ON s.series_id = se.id
      LEFT JOIN media_asset vid ON s.video_asset = vid.id
      LEFT JOIN media_asset aud ON s.audio_asset = aud.id
      LEFT JOIN media_asset thumb ON s.thumbnail_asset = thumb.id
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
        d.view_count as "viewCount",
        d.created_at as "createdAt",
        d.updated_at as "updatedAt",
        CASE WHEN aud.id IS NOT NULL THEN
          json_build_object(
            'id', aud.id,
            'type', aud.kind,
            'url', COALESCE(aud.download_url, aud.hls_url),
            'duration', aud.duration_seconds
          )
        ELSE NULL END as "audioAsset"
      FROM devotional d
      LEFT JOIN media_asset aud ON d.audio_asset = aud.id
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
        e.event_date as "eventDate",
        e.event_time as "eventTime",
        e.location,
        e.is_featured as "isFeatured",
        e.is_published as "isPublished",
        e.created_at as "createdAt",
        e.updated_at as "updatedAt",
        CASE WHEN sp.id IS NOT NULL THEN
          json_build_object(
            'id', sp.id,
            'name', sp.name
          )
        ELSE NULL END as speaker,
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset"
      FROM event e
      LEFT JOIN speaker sp ON e.speaker_id = sp.id
      LEFT JOIN media_asset thumb ON e.thumbnail_asset = thumb.id
      WHERE e.is_published = true AND e.event_date >= NOW()
      ORDER BY e.event_date ASC
      LIMIT 1
      `
    );

    // Query active causes/projects
    const activeCausesResult = await pool.query(
      `
      SELECT
        c.id,
        c.title,
        c.description,
        c.goal_amount as "goalAmount",
        c.raised_amount as "raisedAmount",
        c.start_date as "startDate",
        c.end_date as "endDate",
        c.is_active as "isActive",
        c.is_featured as "isFeatured",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        CASE WHEN thumb.id IS NOT NULL THEN
          json_build_object(
            'id', thumb.id,
            'type', thumb.kind,
            'url', COALESCE(thumb.hls_url, thumb.download_url)
          )
        ELSE NULL END as "thumbnailAsset"
      FROM cause c
      LEFT JOIN media_asset thumb ON c.thumbnail_asset = thumb.id
      WHERE c.is_active = true
        AND (c.end_date IS NULL OR c.end_date >= NOW())
      ORDER BY c.is_featured DESC, c.created_at DESC
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
