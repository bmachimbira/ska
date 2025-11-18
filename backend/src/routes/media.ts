/**
 * Media Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const mediaRouter = Router();

mediaRouter.get(
  '/:assetId',
  asyncHandler(async (req: Request, res: Response) => {
    const { assetId } = req.params;
    // TODO: Implement media URL generation/redirect
    res.redirect('https://example.com/media/' + assetId);
  })
);
