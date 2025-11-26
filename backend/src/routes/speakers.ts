/**
 * Speakers Routes
 * Handles speaker-related endpoints
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middleware/async-handler';
import { getPool } from '../config/database';

const CreateSpeakerSchema = z.object({
  name: z.string().min(1).max(200),
  bio: z.string().nullish(),
  photoAsset: z.string().uuid().nullish(),
});

const UpdateSpeakerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  bio: z.string().nullish(),
  photoAsset: z.string().uuid().nullish(),
});

export const speakersRouter = Router();

/**
 * GET /v1/speakers
 * List all speakers
 */
speakersRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const pool = getPool();

    const query = `
      SELECT 
        id,
        name,
        bio,
        photo_asset,
        created_at,
        updated_at
      FROM speaker
      ORDER BY name ASC
    `;

    const result = await pool.query(query);

    res.json({
      speakers: result.rows,
    });
  })
);

/**
 * GET /v1/speakers/:id
 * Get a specific speaker by ID
 */
speakersRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    const query = `
      SELECT 
        id,
        name,
        bio,
        photo_asset,
        created_at,
        updated_at
      FROM speaker
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Speaker with id ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * POST /v1/speakers
 * Create a new speaker
 */
speakersRouter.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const validated = CreateSpeakerSchema.parse(req.body);
    const pool = getPool();

    const insertQuery = `
      INSERT INTO speaker (
        name,
        bio,
        photo_asset,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, name, bio, photo_asset, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      validated.name,
      validated.bio || null,
      validated.photoAsset || null,
    ]);

    res.status(201).json(result.rows[0]);
  })
);

/**
 * PUT /v1/speakers/:id
 * Update an existing speaker
 */
speakersRouter.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = UpdateSpeakerSchema.parse(req.body);
    const pool = getPool();

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (validated.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(validated.name);
    }

    if (validated.bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(validated.bio);
    }

    if (validated.photoAsset !== undefined) {
      updates.push(`photo_asset = $${paramCount++}`);
      values.push(validated.photoAsset);
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
      UPDATE speaker
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, bio, photo_asset, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Speaker with id ${id} not found`,
      });
    }

    res.json(result.rows[0]);
  })
);

/**
 * DELETE /v1/speakers/:id
 * Delete a speaker
 */
speakersRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const pool = getPool();

    // Check if speaker is referenced by any sermons
    const checkQuery = `
      SELECT COUNT(*) as sermon_count
      FROM sermon
      WHERE speaker_id = $1
    `;

    const checkResult = await pool.query(checkQuery, [id]);
    const sermonCount = parseInt(checkResult.rows[0].sermon_count);

    if (sermonCount > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Cannot delete speaker. They are referenced by ${sermonCount} sermon(s).`,
      });
    }

    const result = await pool.query(
      'DELETE FROM speaker WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Speaker with id ${id} not found`,
      });
    }

    res.status(204).send();
  })
);
