/**
 * Devotionals Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const devotionalsRouter = Router();

devotionalsRouter.get(
  '/today',
  asyncHandler(async (req: Request, res: Response) => {
    const { tz = 'UTC' } = req.query;
    // TODO: Implement timezone-aware today query
    res.json({ message: 'Today\'s devotional' });
  })
);

devotionalsRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { date, page = '1' } = req.query;
    // TODO: Implement devotionals list
    res.json({ devotionals: [], pagination: {} });
  })
);
