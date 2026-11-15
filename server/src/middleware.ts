/* FIREWEAVE  - Express error middleware. Consistent JSON error responses. */

import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  res.status(statusCode).json({
    error: err.message ?? 'Internal server error',
    statusCode,
    timestamp: new Date().toISOString(),
    ...(err.details ? { details: err.details } : {}),
  });
};

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next({ statusCode: 404, message: 'Route not found' } as ApiError);
};

