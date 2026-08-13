/**
 * Contract-shaped sample values used only when the API (or SCHOOL_ID for a
 * school-scoped request) is unavailable. The connection banner always labels them.
 */
import type {
  ContentCalendarRecord,
  DesignJob,
  JobMetric,
  NepalFestival,
  NepalToday,
  SchoolBranding,
  SchoolEvent,
  SchoolProfile,
  SocialPlatformStatus,
  SuccessRateRow,
  SystemStats,
  TopEventRow,
} from './types';

export const sampleStats: SystemStats = {
  schools: 1,
  events: 6,
  jobs: 6,
  assets: 3,
};

export const sampleJobs: DesignJob[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    design_request_id: '10000000-0000-4000-8000-000000000001',
    status: 'APPROVED',
    prompt: 'A respectful school poster using the configured brand palette and logo.',
    generation_time_ms: 18400,
    error_message: null,
    retry_count: 0,
    max_retries: 3,
    created_at: '2026-08-11T06:00:04.000Z',
    started_at: '2026-08-11T06:00:05.000Z',
    completed_at: '2026-08-11T06:00:23.400Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    design_request_id: '10000000-0000-4000-8000-000000000002',
    status: 'PROCESSING',
    prompt: null,
    generation_time_ms: null,
    error_message: null,
    retry_count: 0,
    max_retries: 3,
    created_at: '2026-08-11T09:01:00.000Z',
    started_at: '2026-08-11T09:01:02.000Z',
    completed_at: null,
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    design_request_id: '10000000-0000-4000-8000-000000000003',
    status: 'FAILED',
    prompt: null,
    generation_time_ms: null,
    error_message: 'Image generation timed out',
    retry_count: 1,
    max_retries: 3,
    created_at: '2026-08-11T07:55:00.000Z',
    started_at: '2026-08-11T07:55:01.000Z',
    completed_at: '2026-08-11T08:00:01.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    design_request_id: '10000000-0000-4000-8000-000000000004',
    status: 'QUEUED',
    prompt: null,
    generation_time_ms: null,
    error_message: null,
    retry_count: 0,
    max_retries: 3,
    created_at: '2026-08-11T09:05:00.000Z',
    started_at: null,
    completed_at: null,
  },
];

export const sampleMetrics: JobMetric[] = [
  { status: 'APPROVED', count: 3 },
  { status: 'PROCESSING', count: 1 },
  { status: 'FAILED', count: 1 },
  { status: 'QUEUED', count: 1 },
];

export const sampleCalendar: ContentCalendarRecord[] = [
  {
    id: '20000000-0000-4000-8000-000000000001',
    school_id: '30000000-0000-4000-8000-000000000001',
    event_id: '40000000-0000-4000-8000-000000000001',
    scheduled_publish_date: '2026-08-17',
    platforms: ['facebook', 'instagram'],
    status: 'scheduled',
    caption: 'Warm wishes to our school community on Nag Panchami.',
    hashtags: ['#NagPanchami', '#SchoolCommunity'],
    name: 'Nag Panchami',
    description: 'Traditional festival honouring serpent deities.',
    event_type: 'nepal_festival',
    event_date: '2026-08-17',
    nepali_date: {
      year: 2083,
      month: 5,
      day: 1,
      iso: '2083-05-01',
      formatted: 'Sun, 1 Bhadra 2083',
      formatted_nepali: 'आइत, १ भाद्र २०८३',
      month_name: 'Bhadra',
      month_name_nepali: 'भाद्र',
      weekday: 'Sun',
      weekday_nepali: 'आइत',
    },
    created_at: '2026-08-10T08:00:00.000Z',
    updated_at: '2026-08-10T08:00:00.000Z',
  },
  {
    id: '20000000-0000-4000-8000-000000000002',
    school_id: '30000000-0000-4000-8000-000000000001',
    event_id: '40000000-0000-4000-8000-000000000002',
    scheduled_publish_date: '2026-08-28',
    platforms: ['facebook'],
    status: 'draft',
    caption: 'Celebrating Krishna Janmashtami with our students and families.',
    hashtags: ['#Janmashtami'],
    name: 'Krishna Janmashtami',
    description: 'A scheduled school social post.',
    event_type: 'nepal_festival',
    event_date: '2026-08-28',
    nepali_date: null,
    created_at: '2026-08-10T09:00:00.000Z',
    updated_at: '2026-08-10T09:00:00.000Z',
  },
];

export const sampleBranding: SchoolBranding = {
  name: 'Amar English School',
  tagline: 'Education is the Light of Life',
  logo_url: null,
  brand_colors: { primary: '#0B4F8C', secondary: '#F2C94C', accent: '#FFFFFF' },
  typography: { heading: 'Modern Sans', body: 'Elegant Devanagari' },
  visual_style: 'modern, minimal, editorial, premium',
};

export const sampleSchoolProfile: SchoolProfile = {
  id: '30000000-0000-4000-8000-000000000001',
  name: 'Amar English School',
  tagline: 'Education is the Light of Life',
  location: 'Devchuli-16, Rajahar, Nawalparasi',
  official_logo_url: null,
  brand_colors: { primary: '#0B4F8C', secondary: '#F2C94C', accent: '#FFFFFF' },
  typography: { heading: 'Modern Sans', body: 'Elegant Devanagari' },
  visual_style: 'modern, minimal, editorial, premium',
  logo_protection_rules: null,
  design_preferences: { tone: 'professional, premium, modern and school-appropriate' },
  social_media_info: {
    facebook: 'https://www.facebook.com/amarrajahar16',
    instagram: 'https://www.instagram.com/amarrajahar/',
    tiktok: 'https://www.tiktok.com/@amarenglishschool?lang=en',
  },
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
};

export const sampleSchools: SchoolProfile[] = [sampleSchoolProfile];

export const sampleSocialStatus: SocialPlatformStatus = {
  facebook: true,
  instagram: false,
  tiktok: false,
};

export const sampleToday: NepalToday = {
  ad_date: '2026-08-13',
  nepali_date: {
    year: 2083,
    month: 4,
    day: 29,
    iso: '2083-04-29',
    formatted: 'Thu, 29 Shrawan 2083',
    formatted_nepali: 'बिहि, २९ श्रावण २०८३',
    month_name: 'Shrawan',
    month_name_nepali: 'श्रावण',
    weekday: 'Thu',
    weekday_nepali: 'बिहि',
  },
};

export const sampleFestivals: NepalFestival[] = [
  {
    bs_year: 2083,
    bs_month: 5,
    bs_day: 1,
    name: 'Nag Panchami',
    name_nepali: 'नाग पञ्चमी',
    description: 'Traditional festival honouring serpent deities.',
    scope: 'national',
    is_public_holiday: true,
    ad_date: '2026-08-17',
    nepali_date: {
      year: 2083,
      month: 5,
      day: 1,
      iso: '2083-05-01',
      formatted: 'Sun, 1 Bhadra 2083',
      formatted_nepali: 'आइत, १ भाद्र २०८३',
      month_name: 'Bhadra',
      month_name_nepali: 'भाद्र',
      weekday: 'Sun',
      weekday_nepali: 'आइत',
    },
    category: 'Major Festival',
    content: {
      caption_template: 'Warm wishes to our school community on Nag Panchami.',
      hashtags: ['#NagPanchami', '#SchoolCommunity'],
    },
  },
];

export const sampleTodayEvents: SchoolEvent[] = [];

export const sampleSuccessRates: SuccessRateRow[] = [
  { event_type: 'nepal_festival', total: 4, successful: 3, success_rate: 75 },
  { event_type: 'school', total: 2, successful: 2, success_rate: 100 },
];

export const sampleTopEvents: TopEventRow[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    name: 'Nag Panchami',
    design_count: 3,
    avg_file_size: 420000,
    quality_approved_count: 2,
  },
];
