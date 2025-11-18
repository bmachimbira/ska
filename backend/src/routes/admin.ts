/**
 * Admin Routes
 * Protected routes for content management
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const adminRouter = Router();

// TODO: Add authentication middleware

adminRouter.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement authentication
    res.json({ message: 'Login endpoint' });
  })
);

adminRouter.get(
  '/sermons',
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement admin sermon list
    res.json({ sermons: [] });
  })
);
