import { describe, expect, it } from 'vitest';
import { ContentCalendarService } from './ContentCalendarService';

describe('ContentCalendarService festival helpers', () => {
  it('returns today in both calendars', () => {
    const today = ContentCalendarService.getTodayInNepal();
    expect(today.ad_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today.nepali_date.year).toBeGreaterThan(2000);
    expect(today.nepali_date.month).toBeGreaterThanOrEqual(1);
    expect(today.nepali_date.month).toBeLessThanOrEqual(12);
  });

  it('returns the curated 2083 festival set', () => {
    const festivals = ContentCalendarService.getNepalFestivals(2083);
    expect(festivals.length).toBeGreaterThan(10);
    expect(
      festivals.some((festival) => festival.name.includes('Vijaya Dashami')),
    ).toBe(true);
    expect(festivals.every((festival) => festival.ad_date && festival.nepali_date)).toBe(
      true,
    );
  });

  it('filters festivals by BS month', () => {
    const baisakh = ContentCalendarService.getNepalFestivals(2083, 1);
    expect(baisakh.length).toBeGreaterThan(0);
    expect(baisakh.every((festival) => festival.bs_month === 1)).toBe(true);
  });

  it('rejects an invalid BS month', () => {
    expect(() => ContentCalendarService.getNepalFestivals(2083, 13)).toThrow(
      /BS month/,
    );
  });
});
