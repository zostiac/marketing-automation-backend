import { NextFunction, Request, Response } from 'express';
import { AppError, isAppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Cannot ${req.method} ${req.path}`));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const appError = isAppError(err)
    ? err
    : new AppError(err instanceof Error ? err.message : 'Internal server error');

  if (appError.statusCode >= 500) {
    logger.error('Unhandled request error', {
      path: req.path,
      method: req.method,
      error: err instanceof Error ? err.stack || err.message : String(err),
    });
  } else {
    logger.warn('Request rejected', {
      path: req.path,
      method: req.method,
      status: appError.statusCode,
      code: appError.code,
      message: appError.message,
    });
  }

  res.status(appError.statusCode).json({
    error: appError.message,
    code: appError.code,
    ...(appError.details !== undefined ? { details: appError.details } : {}),
  });
}
