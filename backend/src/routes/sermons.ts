/**
 * Sermons Routes
 * Handles sermon-related endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

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

    // TODO: Implement database queries
    res.json({
      sermons: [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: 0,
        pages: 0,
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

    // TODO: Implement database query
    res.json({
      id: parseInt(id),
      title: 'Sermon Title',
      description: 'Sermon description',
      // ... more fields
    });
  })
);
