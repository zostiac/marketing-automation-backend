/**
 * Sample data — used ONLY when the backend is unreachable, so the dashboard is
 * still explorable while `marketing-automation-backend` is down or unconfigured.
 * The UI flags this state clearly; nothing here is ever presented as live.
 */
import type {
  AutomationRun,
  Branding,
  Channel,
  DashboardStats,
  Design,
  Occasion,
} from './types';

export const sampleOccasions: Occasion[] = [
  {
    id: 'occ_nag_panchami',
    name: 'Nag Panchami',
    nameNepali: 'नाग पञ्चमी',
    date: '2026-08-17',
    status: 'detected',
    source: 'auto',
    description: 'Traditional festival honouring serpent deities.',
    designCount: 2,
  },
  {
    id: 'occ_janmashtami',
    name: 'Krishna Janmashtami',
    nameNepali: 'कृष्ण जन्माष्टमी',
    date: '2026-08-28',
    status: 'upcoming',
    source: 'auto',
    description: 'Celebration of the birth of Lord Krishna.',
    designCount: 1,
  },
  {
    id: 'occ_teej',
    name: 'Haritalika Teej',
    nameNepali: 'हरितालिका तीज',
    date: '2026-09-14',
    status: 'upcoming',
    source: 'auto',
    description: 'Festival celebrated by women with fasting and dancing.',
    designCount: 0,
  },
  {
    id: 'occ_dashain',
    name: 'Dashain (Ghatasthapana)',
    nameNepali: 'घटस्थापना',
    date: '2026-10-11',
    status: 'upcoming',
    source: 'auto',
    description: 'Start of the fifteen-day Dashain festival.',
    designCount: 0,
  },
  {
    id: 'occ_admissions',
    name: 'Admissions Open — Intake 2083',
    date: '2026-09-01',
    status: 'in_progress',
    source: 'manual',
    description: 'Annual admissions campaign for the new academic session.',
    designCount: 3,
  },
  {
    id: 'occ_parents_day',
    name: 'Parents Day',
    date: '2026-07-29',
    status: 'completed',
    source: 'manual',
    description: 'Poster and email sent to all guardians.',
    designCount: 2,
  },
];

export const sampleDesigns: Design[] = [
  {
    id: 'dsg_001',
    occasionId: 'occ_nag_panchami',
    occasionName: 'Nag Panchami',
    title: 'Nag Panchami Poster — Traditional',
    status: 'pending_approval',
    prompt: 'Traditional Nepali serpent motif, deep indigo and gold, school logo bottom-right.',
    createdAt: '2026-08-11T08:12:00.000Z',
    version: 2,
  },
  {
    id: 'dsg_002',
    occasionId: 'occ_nag_panchami',
    occasionName: 'Nag Panchami',
    title: 'Nag Panchami Poster — Minimal',
    status: 'approved',
    prompt: 'Minimal flat illustration, single serpent line art, cream background.',
    createdAt: '2026-08-10T14:40:00.000Z',
    approvedAt: '2026-08-10T16:02:00.000Z',
    version: 1,
  },
  {
    id: 'dsg_003',
    occasionId: 'occ_janmashtami',
    occasionName: 'Krishna Janmashtami',
    title: 'Janmashtami Greeting',
    status: 'generating',
    prompt: 'Krishna with flute, peacock feather, warm dusk palette.',
    createdAt: '2026-08-11T09:01:00.000Z',
    version: 1,
  },
  {
    id: 'dsg_004',
    occasionId: 'occ_admissions',
    occasionName: 'Admissions Open — Intake 2083',
    title: 'Admissions Banner — Hero',
    status: 'approved',
    prompt: 'Bright classroom photo composite, bold admissions headline.',
    createdAt: '2026-08-09T05:20:00.000Z',
    approvedAt: '2026-08-09T07:11:00.000Z',
    version: 3,
  },
  {
    id: 'dsg_005',
    occasionId: 'occ_admissions',
    occasionName: 'Admissions Open — Intake 2083',
    title: 'Admissions Square — Social',
    status: 'rejected',
    prompt: 'Square social crop with call-to-action.',
    createdAt: '2026-08-08T11:30:00.000Z',
    version: 1,
  },
  {
    id: 'dsg_006',
    occasionId: 'occ_teej',
    occasionName: 'Haritalika Teej',
    title: 'Teej Poster — Draft',
    status: 'failed',
    prompt: 'Red saree motif, festive gold accents.',
    createdAt: '2026-08-11T07:55:00.000Z',
    error: 'Image generation timed out after 60s',
    version: 1,
  },
];

export const sampleChannels: Channel[] = [
  { id: 'ch_email', name: 'Gmail', kind: 'email', status: 'connected', detail: 'info@amarenglishschool.edu.np', lastUsedAt: '2026-07-29T10:05:00.000Z' },
  { id: 'ch_fb', name: 'Facebook Page', kind: 'facebook', status: 'connected', detail: 'Amar English School', lastUsedAt: '2026-07-29T10:07:00.000Z' },
  { id: 'ch_ig', name: 'Instagram', kind: 'instagram', status: 'disconnected', detail: 'Not linked' },
  { id: 'ch_wa', name: 'WhatsApp Business', kind: 'whatsapp', status: 'error', detail: 'Token expired' },
];

export const sampleRuns: AutomationRun[] = [
  { id: 'run_01', occasionName: 'Nag Panchami', step: 'Detect occasion', status: 'success', startedAt: '2026-08-11T06:00:00.000Z', durationMs: 820 },
  { id: 'run_02', occasionName: 'Nag Panchami', step: 'Generate design', status: 'success', startedAt: '2026-08-11T06:00:04.000Z', durationMs: 18400 },
  { id: 'run_03', occasionName: 'Haritalika Teej', step: 'Generate design', status: 'failed', startedAt: '2026-08-11T07:55:00.000Z', durationMs: 60010, message: 'Image generation timed out after 60s' },
  { id: 'run_04', occasionName: 'Krishna Janmashtami', step: 'Generate design', status: 'running', startedAt: '2026-08-11T09:01:00.000Z' },
  { id: 'run_05', occasionName: 'Parents Day', step: 'Send email', status: 'success', startedAt: '2026-07-29T10:05:00.000Z', durationMs: 3120, message: 'Sent to 412 guardians' },
];

export const sampleBranding: Branding = {
  schoolName: 'Amar English School',
  tagline: 'Learning today, leading tomorrow',
  primaryColor: '#1d4ed8',
  secondaryColor: '#f59e0b',
  address: 'Kathmandu, Bagmati Province, Nepal',
  phone: '+977-1-4XXXXXX',
  email: 'info@amarenglishschool.edu.np',
};

export const sampleStats: DashboardStats = {
  upcomingOccasions: 4,
  pendingApproval: 1,
  postersThisMonth: 6,
  lastEmailSentAt: '2026-07-29T10:05:00.000Z',
};
