/**
 * Quarterlies Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';
import { z } from 'zod';

// Validation schemas
const CreateQuarterlySchema = z.object({
  kind: z.enum(['adult', 'youth', 'kids']),
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  lang: z.string().default('en'),
});

const UpdateQuarterlySchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
});

export const quarterliesRouter = Router();

/**
 * GET /v1/quarterlies
 * List all quarterlies with optional filters
 * Query params:
 *   - kind: 'adult' | 'youth' | 'kids'
 *   - lang: language code (default: 'en')
 */
quarterliesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { kind, lang = 'en' } = req.query;
    const pool = getPool();

    let query = `
      SELECT
        id,
        kind,
        year,
        quarter,
        title,
        description,
        lang,
        hero_image,
        created_at,
        updated_at
      FROM quarterly
      WHERE 1=1
    `;
    const params: any[] = [];

    // Add filters
    if (kind) {
      params.push(kind);
      query += ` AND kind = $${params.length}`;
    }

    if (lang) {
      params.push(lang);
      query += ` AND lang = $${params.length}`;
    }

    // Order by most recent first
    query += ` ORDER BY year DESC, quarter DESC`;

    const result = await pool.query(query, params);

    res.json({
      quarterlies: result.rows.map(row => ({
        id: row.id,
        kind: row.kind,
        year: row.year,
        quarter: row.quarter,
        title: row.title,
        description: row.description,
        lang: row.lang,
        heroImage: row.hero_image,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  })
);

/**
 * POST /v1/quarterlies/:id/lessons
 * Create a new lesson for a quarterly
 * NOTE: This must come BEFORE /:id route to match correctly
 */
quarterliesRouter.post(
  '/:id/lessons',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = z.object({
      indexInQuarter: z.number().int().min(1).max(52),
      title: z.string().min(1).max(500),
      description: z.string().optional(),
    }).parse(req.body);
    const pool = getPool();

    // Verify quarterly exists
    const quarterlyCheck = await pool.query(
      'SELECT id FROM quarterly WHERE id = $1',
      [id]
    );

    if (quarterlyCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarterly with id ${id} not found`,
      });
    }

    // Check if lesson with same index already exists
    const existingCheck = await pool.query(
      'SELECT id FROM lesson WHERE quarterly_id = $1 AND index_in_quarter = $2',
      [id, validated.indexInQuarter]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Lesson with index ${validated.indexInQuarter} already exists for this quarterly`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO lesson (
        quarterly_id,
        index_in_quarter,
        title,
        description,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, quarterly_id, index_in_quarter, title, description, created_at, updated_at
      `,
      [id, validated.indexInQuarter, validated.title, validated.description || null]
    );

    const row = result.rows[0];
    res.status(201).json({
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
 * GET /v1/quarterlies/:id/lessons
 * Get all lessons for a specific quarterly
 */
quarterliesRouter.get(
  '/:id/lessons',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    // First verify the quarterly exists
    const quarterlyResult = await pool.query(
      'SELECT id FROM quarterly WHERE id = $1',
      [id]
    );

    if (quarterlyResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarterly with id ${id} not found`,
      });
    }

    // Get all lessons for this quarterly
    const result = await pool.query(
      `
      SELECT
        id,
        quarterly_id,
        index_in_quarter,
        title,
        description,
        created_at,
        updated_at
      FROM lesson
      WHERE quarterly_id = $1
      ORDER BY index_in_quarter ASC
      `,
      [id]
    );

    res.json({
      lessons: result.rows.map(row => ({
        id: row.id,
        quarterlyId: row.quarterly_id,
        indexInQuarter: row.index_in_quarter,
        title: row.title,
        description: row.description,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  })
);

/**
 * GET /v1/quarterlies/:id
 * Get a single quarterly by ID
 */
quarterliesRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        id,
        kind,
        year,
        quarter,
        title,
        description,
        lang,
        hero_image,
        created_at,
        updated_at
      FROM quarterly
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarterly with id ${id} not found`,
      });
    }

    const row = result.rows[0];
    res.json({
      quarterly: {
        id: row.id,
        kind: row.kind,
        year: row.year,
        quarter: row.quarter,
        title: row.title,
        description: row.description,
        lang: row.lang,
        heroImage: row.hero_image,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * POST /v1/quarterlies
 * Create a new quarterly
 */
quarterliesRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateQuarterlySchema.parse(req.body);
    const pool = getPool();

    // Check if quarterly already exists
    const existingCheck = await pool.query(
      'SELECT id FROM quarterly WHERE kind = $1 AND year = $2 AND quarter = $3 AND lang = $4',
      [validated.kind, validated.year, validated.quarter, validated.lang]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Quarterly for ${validated.kind} Q${validated.quarter} ${validated.year} (${validated.lang}) already exists`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO quarterly (
        kind,
        year,
        quarter,
        title,
        description,
        lang,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, kind, year, quarter, title, description, lang, hero_image, created_at, updated_at
      `,
      [
        validated.kind,
        validated.year,
        validated.quarter,
        validated.title,
        validated.description || null,
        validated.lang,
      ]
    );

    const row = result.rows[0];
    res.status(201).json({
      quarterly: {
        id: row.id,
        kind: row.kind,
        year: row.year,
        quarter: row.quarter,
        title: row.title,
        description: row.description,
        lang: row.lang,
        heroImage: row.hero_image,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * PUT /v1/quarterlies/:id
 * Update an existing quarterly
 */
quarterliesRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateQuarterlySchema.parse(req.body);
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
      UPDATE quarterly
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, kind, year, quarter, title, description, lang, hero_image, created_at, updated_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarterly with id ${id} not found`,
      });
    }

    const row = result.rows[0];
    res.json({
      quarterly: {
        id: row.id,
        kind: row.kind,
        year: row.year,
        quarter: row.quarter,
        title: row.title,
        description: row.description,
        lang: row.lang,
        heroImage: row.hero_image,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  })
);

/**
 * DELETE /v1/quarterlies/:id
 * Delete a quarterly (and all its lessons due to CASCADE)
 */
quarterliesRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM quarterly WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quarterly with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
