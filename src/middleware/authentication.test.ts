import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { authenticate } from './authentication';

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function mockRes(): Response {
  return {} as Response;
}

describe('authenticate', () => {
  const originalToken = config.api_token;

  beforeEach(() => {
    config.api_token = originalToken;
  });

  it('allows all requests when API_TOKEN is unset', () => {
    config.api_token = '';
    const next = vi.fn();
    authenticate(mockReq(), mockRes(), next as NextFunction);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects missing tokens when API_TOKEN is set', () => {
    config.api_token = 'secret-token';
    const next = vi.fn();
    authenticate(mockReq(), mockRes(), next as NextFunction);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('accepts a matching bearer token', () => {
    config.api_token = 'secret-token';
    const next = vi.fn();
    authenticate(
      mockReq({ authorization: 'Bearer secret-token' }),
      mockRes(),
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledWith();
  });

  it('accepts a matching X-API-Key header', () => {
    config.api_token = 'secret-token';
    const next = vi.fn();
    authenticate(
      mockReq({ 'x-api-key': 'secret-token' }),
      mockRes(),
      next as NextFunction,
    );
    expect(next).toHaveBeenCalledWith();
  });
});
