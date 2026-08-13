import { describe, expect, it } from 'vitest';
import { DELETABLE_STATUSES, isDeletableStatus } from './DesignJobCleanup';

describe('isDeletableStatus', () => {
  it('allows failed jobs in any casing', () => {
    expect(isDeletableStatus('FAILED')).toBe(true);
    expect(isDeletableStatus('failed')).toBe(true);
  });

  it('refuses jobs that are still queued, running, or already approved', () => {
    expect(isDeletableStatus('QUEUED')).toBe(false);
    expect(isDeletableStatus('PROCESSING')).toBe(false);
    expect(isDeletableStatus('APPROVED')).toBe(false);
  });

  it('refuses missing statuses', () => {
    expect(isDeletableStatus(undefined)).toBe(false);
    expect(isDeletableStatus(null)).toBe(false);
    expect(isDeletableStatus('')).toBe(false);
  });

  it('exposes FAILED as the only deletable status', () => {
    expect([...DELETABLE_STATUSES]).toEqual(['FAILED']);
  });
});
