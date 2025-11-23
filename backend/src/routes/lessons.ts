/**
 * Lessons Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';
import { z } from 'zod';

// Validation schemas
const CreateLessonSchema = z.object({
  indexInQuarter: z.number().int().min(1).max(52),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
});

const UpdateLessonSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
});

const CreateLessonDaySchema = z.object({
  dayIndex: z.number().int().min(1).max(7),
  title: z.string().min(1).max(500),
  bodyMd: z.string(),
  memoryVerse: z.string().optional(),
  date: z.string().optional(), // ISO date string
});

const UpdateLessonDaySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  bodyMd: z.string().optional(),
  memoryVerse: z.string().optional(),
  date: z.string().optional(),
});

export const lessonsRouter = Router();

/**
 * GET /v1/lessons/:id/days/:dayIndex
 * Get a specific day of a lesson by day index (1-7)
 * NOTE: This must come BEFORE /:id route to match correctly
 */
lessonsRouter.get(
  '/:id/days/:dayIndex',
  asyncHandler(async (req: Request, res: Response) => {
    const { id, dayIndex } = req.params;
    const pool = getPool();

    // Validate dayIndex
    const dayIndexNum = parseInt(dayIndex);
    if (isNaN(dayIndexNum) || dayIndexNum < 1 || dayIndexNum > 7) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dayIndex must be a number between 1 and 7',
      });
    }

    // Get lesson day with lesson and quarterly context
    const result = await pool.query(
      `
      SELECT
        ld.id,
        ld.lesson_id,
        ld.day_index,
        ld.date,
        ld.title,
        ld.body_md,
        ld.memory_verse,
        ld.audio_asset,
        ld.created_at,
        ld.updated_at,
        l.title as lesson_title,
        l.index_in_quarter,
        l.quarterly_id,
        q.kind,
        q.year,
        q.quarter,
        q.title as quarterly_title
      FROM lesson_day ld
      JOIN lesson l ON ld.lesson_id = l.id
      JOIN quarterly q ON l.quarterly_id = q.id
      WHERE ld.lesson_id = $1 AND ld.day_index = $2
      `,
      [id, dayIndexNum]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson day with dayIndex ${dayIndex} for lesson ${id} not found`,
      });
    }

    const day = result.rows[0];

    res.json({
      day: {
        id: day.id,
        lessonId: day.lesson_id,
        dayIndex: day.day_index,
        date: day.date,
        title: day.title,
        bodyMd: day.body_md,
        memoryVerse: day.memory_verse,
        audioAsset: day.audio_asset,
        createdAt: day.created_at,
        updatedAt: day.updated_at,
        lesson: {
          id: day.lesson_id,
          title: day.lesson_title,
          indexInQuarter: day.index_in_quarter,
          quarterlyId: day.quarterly_id,
        },
        quarterly: {
          id: day.quarterly_id,
          kind: day.kind,
          year: day.year,
          quarter: day.quarter,
          title: day.quarterly_title,
        },
      },
    });
  })
);

/**
 * GET /v1/lessons/:id
 * Get a single lesson by ID with all its days
 */
lessonsRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    // Get lesson details
    const lessonResult = await pool.query(
      `
      SELECT
        l.id,
        l.quarterly_id,
        l.index_in_quarter,
        l.title,
        l.description,
        l.created_at,
        l.updated_at,
        q.kind,
        q.year,
        q.quarter,
        q.title as quarterly_title
      FROM lesson l
      JOIN quarterly q ON l.quarterly_id = q.id
      WHERE l.id = $1
      `,
      [id]
    );

    if (lessonResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson with id ${id} not found`,
      });
    }

    const lesson = lessonResult.rows[0];

    // Get all days for this lesson
    const daysResult = await pool.query(
      `
      SELECT
        id,
        lesson_id,
        day_index,
        date,
        title,
        body_md,
        memory_verse,
        audio_asset,
        created_at,
        updated_at
      FROM lesson_day
      WHERE lesson_id = $1
      ORDER BY day_index ASC
      `,
      [id]
    );

    res.json({
      lesson: {
        id: lesson.id,
        quarterlyId: lesson.quarterly_id,
        indexInQuarter: lesson.index_in_quarter,
        title: lesson.title,
        description: lesson.description,
        createdAt: lesson.created_at,
        updatedAt: lesson.updated_at,
        quarterly: {
          id: lesson.quarterly_id,
          kind: lesson.kind,
          year: lesson.year,
          quarter: lesson.quarter,
          title: lesson.quarterly_title,
        },
        days: daysResult.rows.map(day => ({
          id: day.id,
          lessonId: day.lesson_id,
          dayIndex: day.day_index,
          date: day.date,
          title: day.title,
          bodyMd: day.body_md,
          memoryVerse: day.memory_verse,
          audioAsset: day.audio_asset,
          createdAt: day.created_at,
          updatedAt: day.updated_at,
        })),
      },
    });
  })
);

/**
 * PUT /v1/lessons/:id
 * Update a lesson
 */
lessonsRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateLessonSchema.parse(req.body);
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

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `
      UPDATE lesson
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, quarterly_id, index_in_quarter, title, description, created_at, updated_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson with id ${id} not found`,
      });
    }

    const row = result.rows[0];
    res.json({
      lesson: {
        id: row.id,
        quarterlyId: row.quarterly_id,
        indexInQuarter: row.index_in_quarter,
        title: row.title,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * DELETE /v1/lessons/:id
 * Delete a lesson (and all its days due to CASCADE)
 */
lessonsRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM lesson WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);

/**
 * POST /v1/lessons/:id/days
 * Create a new lesson day
 */
lessonsRouter.post(
  '/:id/days',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = CreateLessonDaySchema.parse(req.body);
    const pool = getPool();

    // Verify lesson exists
    const lessonCheck = await pool.query(
      'SELECT id FROM lesson WHERE id = $1',
      [id]
    );

    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson with id ${id} not found`,
      });
    }

    // Check if day already exists
    const existingCheck = await pool.query(
      'SELECT id FROM lesson_day WHERE lesson_id = $1 AND day_index = $2',
      [id, validated.dayIndex]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Lesson day with dayIndex ${validated.dayIndex} already exists for this lesson`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO lesson_day (
        lesson_id,
        day_index,
        title,
        body_md,
        memory_verse,
        date,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, lesson_id, day_index, date, title, body_md, memory_verse, audio_asset, created_at, updated_at
      `,
      [
        id,
        validated.dayIndex,
        validated.title,
        validated.bodyMd,
        validated.memoryVerse || null,
        validated.date || null,
      ]
    );

    const row = result.rows[0];
    res.status(201).json({
      day: {
        id: row.id,
        lessonId: row.lesson_id,
        dayIndex: row.day_index,
        date: row.date,
        title: row.title,
        bodyMd: row.body_md,
        memoryVerse: row.memory_verse,
        audioAsset: row.audio_asset,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * PUT /v1/lessons/:id/days/:dayIndex
 * Update a lesson day
 */
lessonsRouter.put(
  '/:id/days/:dayIndex',
  asyncHandler(async (req: Request, res: Response) => {
    const { id, dayIndex } = req.params;
    const validated = UpdateLessonDaySchema.parse(req.body);
    const pool = getPool();

    const dayIndexNum = parseInt(dayIndex);
    if (isNaN(dayIndexNum) || dayIndexNum < 1 || dayIndexNum > 7) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dayIndex must be a number between 1 and 7',
      });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validated.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(validated.title);
    }

    if (validated.bodyMd !== undefined) {
      updates.push(`body_md = $${paramCount++}`);
      values.push(validated.bodyMd);
    }

    if (validated.memoryVerse !== undefined) {
      updates.push(`memory_verse = $${paramCount++}`);
      values.push(validated.memoryVerse);
    }

    if (validated.date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(validated.date);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, dayIndexNum);

    const result = await pool.query(
      `
      UPDATE lesson_day
      SET ${updates.join(', ')}
      WHERE lesson_id = $${paramCount++} AND day_index = $${paramCount}
      RETURNING id, lesson_id, day_index, date, title, body_md, memory_verse, audio_asset, created_at, updated_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson day with dayIndex ${dayIndex} for lesson ${id} not found`,
      });
    }

    const row = result.rows[0];
    res.json({
      day: {
        id: row.id,
        lessonId: row.lesson_id,
        dayIndex: row.day_index,
        date: row.date,
        title: row.title,
        bodyMd: row.body_md,
        memoryVerse: row.memory_verse,
        audioAsset: row.audio_asset,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * DELETE /v1/lessons/:id/days/:dayIndex
 * Delete a lesson day
 */
lessonsRouter.delete(
  '/:id/days/:dayIndex',
  asyncHandler(async (req: Request, res: Response) => {
    const { id, dayIndex } = req.params;
    const pool = getPool();

    const dayIndexNum = parseInt(dayIndex);
    if (isNaN(dayIndexNum) || dayIndexNum < 1 || dayIndexNum > 7) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'dayIndex must be a number between 1 and 7',
      });
    }

    const result = await pool.query(
      'DELETE FROM lesson_day WHERE lesson_id = $1 AND day_index = $2 RETURNING id',
      [id, dayIndexNum]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lesson day with dayIndex ${dayIndex} for lesson ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
