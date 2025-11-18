/**
 * Search Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const searchRouter = Router();

searchRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    // TODO: Implement full-text search
    res.json({ results: [], query: q });
  })
);
