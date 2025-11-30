import { Router, Request, Response } from 'express';
import { getPool } from '../db';
import { asyncHandler } from '../middleware/async-handler';

export const causesRouter = Router();

// Get all causes
causesRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const { active, featured } = req.query;

  let query = `
    SELECT id, title, description, goal_amount, raised_amount, thumbnail_asset,
           start_date, end_date, is_active, is_featured, created_at, updated_at
    FROM cause
    WHERE 1=1
  `;

  const queryParams: any[] = [];

  if (active !== undefined) {
    query += ` AND is_active = $${queryParams.length + 1}`;
    queryParams.push(active === 'true');
  }

  if (featured !== undefined) {
    query += ` AND is_featured = $${queryParams.length + 1}`;
    queryParams.push(featured === 'true');
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, queryParams);
  res.json(result.rows);
}));

// Get active causes for homepage
causesRouter.get('/active', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const query = `
    SELECT id, title, description, goal_amount, raised_amount, thumbnail_asset,
           start_date, end_date, is_active, is_featured, created_at, updated_at
    FROM cause
    WHERE is_active = true
      AND (end_date IS NULL OR end_date >= NOW())
    ORDER BY is_featured DESC, created_at DESC
    LIMIT 6
  `;

  const result = await pool.query(query);
  res.json(result.rows);
}));

// Get single cause
causesRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const { id } = req.params;

  const query = `
    SELECT id, title, description, goal_amount, raised_amount, thumbnail_asset,
           start_date, end_date, is_active, is_featured, created_at, updated_at
    FROM cause
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Cause not found' });
    return;
  }

  res.json(result.rows[0]);
}));

// Create new cause
causesRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const {
    title,
    description,
    goalAmount,
    raisedAmount,
    thumbnailAsset,
    startDate,
    endDate,
    isActive,
    isFeatured,
  } = req.body;

  const query = `
    INSERT INTO cause (
      title, description, goal_amount, raised_amount, thumbnail_asset,
      start_date, end_date, is_active, is_featured
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    title,
    description,
    goalAmount || null,
    raisedAmount || 0,
    thumbnailAsset || null,
    startDate || null,
    endDate || null,
    isActive !== undefined ? isActive : true,
    isFeatured || false,
  ];

  const result = await pool.query(query, values);
  res.status(201).json(result.rows[0]);
}));

// Update cause
causesRouter.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const { id } = req.params;
  const {
    title,
    description,
    goalAmount,
    raisedAmount,
    thumbnailAsset,
    startDate,
    endDate,
    isActive,
    isFeatured,
  } = req.body;

  const query = `
    UPDATE cause
    SET title = $1,
        description = $2,
        goal_amount = $3,
        raised_amount = $4,
        thumbnail_asset = $5,
        start_date = $6,
        end_date = $7,
        is_active = $8,
        is_featured = $9,
        updated_at = NOW()
    WHERE id = $10
    RETURNING *
  `;

  const values = [
    title,
    description,
    goalAmount || null,
    raisedAmount || 0,
    thumbnailAsset || null,
    startDate || null,
    endDate || null,
    isActive !== undefined ? isActive : true,
    isFeatured || false,
    id,
  ];

  const result = await pool.query(query, values);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Cause not found' });
    return;
  }

  res.json(result.rows[0]);
}));

// Delete cause
causesRouter.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const pool = getPool();
  const { id } = req.params;

  const result = await pool.query('DELETE FROM cause WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Cause not found' });
    return;
  }

  res.status(204).send();
}));
