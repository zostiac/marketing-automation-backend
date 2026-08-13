import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { timingSafeEqualString } from '../utils/helpers';
import { logger } from '../utils/logger';

let warnedMissingToken = false;

export function warnIfAuthDisabled(): void {
  if (config.api_token || warnedMissingToken) return;
  warnedMissingToken = true;
  logger.warn(
    'API_TOKEN is not set. All /api routes are public. Set API_TOKEN before exposing this service.',
  );
}

function extractToken(req: Request): string {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  const apiKey = req.headers['x-api-key'];
  if (typeof apiKey === 'string') return apiKey.trim();
  return '';
}

/**
 * Bearer / X-API-Key auth for /api routes.
 * Disabled when API_TOKEN is unset so existing deploys keep working.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  warnIfAuthDisabled();

  if (!config.api_token) {
    next();
    return;
  }

  const provided = extractToken(req);
  if (!provided || !timingSafeEqualString(provided, config.api_token)) {
    next(AppError.unauthorized('Invalid or missing API token'));
    return;
  }

  next();
}
