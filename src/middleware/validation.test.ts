import { describe, expect, it } from 'vitest';
import { designRequestSchema, syncFestivalsSchema } from './validation';

describe('request schemas', () => {
  it('accepts a valid design request', () => {
    const parsed = designRequestSchema.safeParse({
      school_id: '550e8400-e29b-41d4-a716-446655440000',
      event_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      design_type: 'poster',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid school id', () => {
    const parsed = designRequestSchema.safeParse({
      school_id: 'not-a-uuid',
      event_id: '22222222-2222-2222-2222-222222222222',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts a festival sync payload', () => {
    const parsed = syncFestivalsSchema.safeParse({
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      bsYear: 2083,
      createCalendarEntries: true,
      platforms: ['facebook'],
    });
    expect(parsed.success).toBe(true);
  });
});
