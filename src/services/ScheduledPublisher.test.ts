import { describe, expect, it } from 'vitest';
import { isPublishDue, selectPublishPlatforms } from './ScheduledPublisher';

describe('isPublishDue', () => {
  it('treats today and earlier dates as due', () => {
    expect(isPublishDue('2026-08-13', '2026-08-13')).toBe(true);
    expect(isPublishDue('2026-08-12T00:00:00.000Z', '2026-08-13')).toBe(true);
    expect(isPublishDue('2026-08-14', '2026-08-13')).toBe(false);
  });
});

describe('selectPublishPlatforms', () => {
  it('keeps only requested platforms that have credentials', () => {
    expect(
      selectPublishPlatforms(['facebook', 'tiktok', 'unknown'], ['facebook']),
    ).toEqual(['facebook']);
  });
});
