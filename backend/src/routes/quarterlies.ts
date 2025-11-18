/**
 * Quarterlies Routes
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const quarterliesRouter = Router();

quarterliesRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { kind, lang = 'en' } = req.query;
    // TODO: Implement quarterlies query
    res.json({ quarterlies: [] });
  })
);

quarterliesRouter.get(
  '/:id/lessons',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Implement lessons query
    res.json({ lessons: [] });
  })
);
