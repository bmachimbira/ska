/**
 * Request Logger Middleware
 * Logs all incoming requests
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Log request
  console.log(`→ ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusSymbol = status >= 500 ? '✗' : status >= 400 ? '⚠' : '✓';

    console.log(
      `${statusSymbol} ${req.method} ${req.path} ${status} ${duration}ms`
    );
  });

  next();
}
