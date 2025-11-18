/**
 * Chat Routes (RAG-powered study chat)
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const chatRouter = Router();

chatRouter.post(
  '/query',
  asyncHandler(async (req: Request, res: Response) => {
    const { mode, contextRef, query, topK = 6 } = req.body;

    // TODO: Implement RAG pipeline
    res.json({
      answer: 'This is a placeholder answer.',
      citations: [],
      safety: { flagged: false },
    });
  })
);
