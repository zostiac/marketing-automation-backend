import { describe, expect, it } from 'vitest';
import { AppError, isAppError } from './errors';

describe('AppError', () => {
  it('creates typed HTTP errors', () => {
    expect(AppError.badRequest('nope').statusCode).toBe(400);
    expect(AppError.unauthorized().code).toBe('UNAUTHORIZED');
    expect(AppError.notFound('missing').statusCode).toBe(404);
    expect(AppError.conflict('exists').statusCode).toBe(409);
  });

  it('detects AppError instances', () => {
    expect(isAppError(AppError.badRequest('x'))).toBe(true);
    expect(isAppError(new Error('x'))).toBe(false);
  });
});
