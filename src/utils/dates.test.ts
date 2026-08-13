import { describe, expect, it } from 'vitest';
import { formatIsoDate, kathmanduTodayIso, utcDateToIso } from './dates';

describe('date helpers', () => {
  it('pads ISO dates', () => {
    expect(formatIsoDate(2026, 8, 13)).toBe('2026-08-13');
    expect(formatIsoDate(2083, 1, 1)).toBe('2083-01-01');
  });

  it('returns a Kathmandu calendar date', () => {
    expect(kathmanduTodayIso(new Date('2026-08-13T18:30:00.000Z'))).toBe(
      '2026-08-14',
    );
  });

  it('converts UTC dates to ISO date strings', () => {
    expect(utcDateToIso(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-01-05');
  });
});
