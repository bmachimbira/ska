/**
 * API Router
 * Combines all route modules
 */

import { Router } from 'express';
import { homeRouter } from './home';
import { sermonsRouter } from './sermons';
import { speakersRouter } from './speakers';
import { devotionalsRouter } from './devotionals';
import { quarterliesRouter } from './quarterlies';
import { lessonsRouter } from './lessons';
import { searchRouter } from './search';
import { mediaRouter } from './media';
import { chatRouter } from './chat';
import { adminRouter } from './admin';
import { statsRouter } from './stats';
import { eventsRouter } from './events';
import { causesRouter } from './causes';

export function createApiRouter(): Router {
  const router = Router();

  // Public routes
  router.use('/home', homeRouter);
  router.use('/sermons', sermonsRouter);
  router.use('/speakers', speakersRouter);
  router.use('/devotionals', devotionalsRouter);
  router.use('/quarterlies', quarterliesRouter);
  router.use('/lessons', lessonsRouter);
  router.use('/search', searchRouter);
  router.use('/media', mediaRouter);
  router.use('/chat', chatRouter);
  router.use('/stats', statsRouter);
  router.use('/events', eventsRouter);
  router.use('/causes', causesRouter);

  // Admin routes (protected)
  router.use('/admin', adminRouter);

  return router;
}
