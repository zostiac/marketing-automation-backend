/**
 * Prompt composition used by the Prompts page.
 *
 * Prompts are built on demand (server action) instead of being pre-rendered next
 * to every calendar entry, so the wording can react to the selected tool, format,
 * tone, school branding, and the operator's own notes.
 */

import type { SchoolBranding } from './types';

/**
 * Server-action state for prompt generation. It lives here (not in `actions.ts`)
 * because a `'use server'` module may only export async functions.
 */
export interface PromptState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  prompt?: string;
  /** Increments with each successful generation so the wording varies. */
  variant?: number;
  /** Echoed back so the result panel can label what was generated. */
  target?: PromptTarget;
  eventName?: string;
}

export const INITIAL_PROMPT_STATE: PromptState = { status: 'idle', variant: 0 };

export const PROMPT_TARGETS = ['chatgpt', 'gemini', 'midjourney'] as const;
export type PromptTarget = (typeof PROMPT_TARGETS)[number];

export const PROMPT_FORMATS = ['landscape', 'square', 'story'] as const;
export type PromptFormat = (typeof PROMPT_FORMATS)[number];

export const PROMPT_TONES = ['celebratory', 'formal', 'playful', 'minimal'] as const;
export type PromptTone = (typeof PROMPT_TONES)[number];

export const TARGET_LABELS: Record<PromptTarget, string> = {
  chatgpt: 'ChatGPT / DALL·E',
  gemini: 'Gemini / Imagen',
  midjourney: 'Midjourney',
};

export const FORMAT_LABELS: Record<PromptFormat, string> = {
  landscape: 'Landscape · 1200 × 630',
  square: 'Square · 1080 × 1080',
  story: 'Story · 1080 × 1920',
};

export const TONE_LABELS: Record<PromptTone, string> = {
  celebratory: 'Celebratory',
  formal: 'Formal',
  playful: 'Playful',
  minimal: 'Minimal',
};

const DIMENSIONS: Record<PromptFormat, { width: number; height: number; note: string }> = {
  landscape: { width: 1200, height: 630, note: 'Facebook / website banner crop' },
  square: { width: 1080, height: 1080, note: 'Instagram feed crop' },
  story: { width: 1080, height: 1920, note: 'Instagram / TikTok story crop' },
};

const TONE_DIRECTION: Record<PromptTone, string> = {
  celebratory: 'warm, festive and high-energy without becoming noisy',
  formal: 'composed, institutional and confidence-building',
  playful: 'bright, friendly and student-facing',
  minimal: 'restrained, spacious and typography-led',
};

/** Wording variants so "Generate again" produces a genuinely different brief. */
const OPENERS = [
  'Create a polished, ready-to-publish social media graphic for a Nepal-based school.',
  'Design a publication-ready school marketing poster for a Nepal-based school.',
  'Produce a finished social media announcement graphic for a school in Nepal.',
];

const ART_DIRECTION = [
  'Editorial school-campaign look: clear focal point on the event name, deliberate whitespace, layered depth, and crisp typography that survives a mobile-sized crop.',
  'Modern campus-communications look: strong grid, confident type hierarchy, controlled colour blocking, and a single clear subject rather than a collage.',
  'Premium print-poster look: generous margins, one dominant headline, supporting detail line, and texture used sparingly to add depth.',
];

export interface PromptInput {
  eventName: string;
  eventType?: string | null;
  eventDate?: string | null;
  description?: string | null;
  platforms?: string[];
  target: PromptTarget;
  format: PromptFormat;
  tone: PromptTone;
  notes?: string | null;
  /** Rotates the wording variants; increment for each regeneration. */
  variant?: number;
  branding?: SchoolBranding | null;
}

function brandingLines(branding?: SchoolBranding | null): string[] {
  if (!branding) return [];
  const colors = branding.brand_colors
    ? Object.entries(branding.brand_colors)
        .map(([key, value]) => `${key} ${value}`)
        .join(', ')
    : '';
  const font =
    branding.typography && typeof branding.typography === 'object'
      ? String(
          (branding.typography as Record<string, unknown>).primary_font ??
            (branding.typography as Record<string, unknown>).primary ??
            '',
        )
      : '';

  return [
    branding.name ? `School: ${branding.name}` : null,
    branding.tagline ? `Tagline: ${branding.tagline}` : null,
    colors ? `Brand colours: ${colors}` : null,
    font ? `Typeface feel: ${font}` : null,
    branding.visual_style ? `House visual style: ${branding.visual_style}` : null,
  ].filter((line): line is string => Boolean(line));
}

export function buildPrompt(input: PromptInput): string {
  const variant = Math.abs(Math.trunc(input.variant ?? 0));
  const size = DIMENSIONS[input.format];
  const opener = OPENERS[variant % OPENERS.length];
  const direction = ART_DIRECTION[variant % ART_DIRECTION.length];

  const brief = [
    `Event: ${input.eventName}`,
    input.eventType ? `Type: ${input.eventType.replaceAll('_', ' ')}` : null,
    input.eventDate ? `Date: ${input.eventDate}` : null,
    input.description ? `Context: ${input.description}` : null,
    input.platforms?.length ? `Channels: ${input.platforms.join(', ')}` : null,
    ...brandingLines(input.branding),
  ]
    .filter(Boolean)
    .join('\n');

  const base = [
    opener,
    '',
    'BRIEF',
    brief,
    '',
    'OUTPUT',
    `Canvas: ${size.width} × ${size.height} px (${input.format}) — ${size.note}.`,
    `Mood: ${TONE_DIRECTION[input.tone]}.`,
    '',
    'ART DIRECTION',
    direction,
    'Keep clean, intentional space for the school logo. Use Nepal-inspired cultural detail only where it genuinely fits the event.',
    '',
    'MUST',
    '- Event name is the clear focal point and is spelled exactly as written above.',
    '- All on-image text is accurate, readable and free of gibberish characters.',
    '- Layout stays legible at thumbnail size.',
    '',
    "MUSTN'T",
    '- No watermarks, no signatures, no stock-photo styling.',
    '- No crowded collages, no distorted faces, no unreadable decorative type.',
    input.notes?.trim() ? `\nADDITIONAL NOTES\n${input.notes.trim()}` : '',
  ]
    .filter((section) => section !== '')
    .join('\n');

  if (input.target === 'midjourney') {
    const aspect = input.format === 'square' ? '1:1' : input.format === 'story' ? '9:16' : '191:100';
    return `${base}\n\nRender as a single finished graphic.\n--ar ${aspect} --style raw --quality 2`;
  }

  if (input.target === 'gemini') {
    return `${base}\n\nReturn only the finished graphic — no explanation, no alternative versions.`;
  }

  return `${base}\n\nGenerate the finished image directly. Do not describe it back to me first.`;
}

export function isPromptTarget(value: string): value is PromptTarget {
  return (PROMPT_TARGETS as readonly string[]).includes(value);
}

export function isPromptFormat(value: string): value is PromptFormat {
  return (PROMPT_FORMATS as readonly string[]).includes(value);
}

export function isPromptTone(value: string): value is PromptTone {
  return (PROMPT_TONES as readonly string[]).includes(value);
}
