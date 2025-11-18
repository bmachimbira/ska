/**
 * Home Route
 * GET /v1/home - Featured content and today's highlights
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';

export const homeRouter = Router();

/**
 * GET /v1/home
 * Returns featured sermons, today's devotional, and current quarterlies
 */
homeRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implement actual database queries
    // For now, return mock data

    const homeData = {
      featuredSermons: [
        {
          id: 1,
          title: 'The Power of Grace',
          description: "Discover how God's grace transforms our lives.",
          thumbnailUrl: 'https://via.placeholder.com/400x225',
          speaker: {
            id: 1,
            name: 'Pastor John Smith',
          },
          publishedAt: new Date().toISOString(),
        },
      ],
      todayDevotional: {
        id: 1,
        title: "God's Unfailing Love",
        author: 'Ellen G. White',
        date: new Date().toISOString().split('T')[0],
        excerpt: "For God so loved the world...",
      },
      currentQuarterlies: [
        {
          id: 1,
          kind: 'adult',
          title: 'The Book of Romans',
          year: 2025,
          quarter: 1,
        },
        {
          id: 2,
          kind: 'youth',
          title: 'Heroes of Faith',
          year: 2025,
          quarter: 1,
        },
        {
          id: 3,
          kind: 'kids',
          title: 'Jesus and Me',
          year: 2025,
          quarter: 1,
        },
      ],
    };

    res.json(homeData);
  })
);
