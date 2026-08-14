'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, configuredSchoolId } from '@/lib/api';
import { getBranding } from '@/lib/data';
import {
  buildPrompt,
  type PromptState,
  isPromptFormat,
  isPromptTarget,
  isPromptTone,
  type PromptFormat,
  type PromptTarget,
  type PromptTone,
} from '@/lib/prompt';

export interface ActionState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function requestDesignAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const schoolId = configuredSchoolId();
  const eventId = String(formData.get('event_id') ?? '').trim();
  const designType = String(formData.get('design_type') ?? 'poster').trim() || 'poster';

  if (!schoolId) return { status: 'error', message: 'SCHOOL_ID is not configured' };
  if (!eventId) return { status: 'error', message: 'Event ID is missing' };

  try {
    const result = await apiFetch<{ jobId: string; status: string }>('/api/designs/request', {
      method: 'POST',
      body: JSON.stringify({
        school_id: schoolId,
        event_id: eventId,
        design_type: designType,
      }),
    });

    revalidatePath('/');
    revalidatePath('/designs');
    revalidatePath('/history');
    return { status: 'success', message: `Queued job ${result.jobId.slice(0, 8)}…` };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function retryJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobId = String(formData.get('job_id') ?? '').trim();
  if (!jobId) return { status: 'error', message: 'Job ID is missing' };

  try {
    await apiFetch<{ status: string }>(`/api/jobs/${encodeURIComponent(jobId)}/retry`, {
      method: 'POST',
    });

    revalidatePath('/');
    revalidatePath('/designs');
    revalidatePath('/history');
    return { status: 'success', message: 'Job queued again' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function deleteJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobId = String(formData.get('job_id') ?? '').trim();
  if (!jobId) return { status: 'error', message: 'Job ID is missing' };

  try {
    await apiFetch<{ deleted: number }>(`/api/jobs/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    });

    revalidatePath('/');
    revalidatePath('/designs');
    revalidatePath('/history');
    return { status: 'success', message: 'Failed job deleted' };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function deleteFailedJobsAction(
  _previous: ActionState,
  _formData?: FormData,
): Promise<ActionState> {
  try {
    const result = await apiFetch<{ deleted: number }>('/api/jobs/failed', {
      method: 'DELETE',
    });

    revalidatePath('/');
    revalidatePath('/designs');
    revalidatePath('/history');
    return {
      status: 'success',
      message: `Deleted ${result.deleted} failed job${result.deleted === 1 ? '' : 's'}`,
    };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function publishEntryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const entryId = String(formData.get('entry_id') ?? '').trim();
  if (!entryId) return { status: 'error', message: 'Calendar entry ID is missing' };

  try {
    const result = await apiFetch<{ status: string; error?: string }>(
      `/api/calendar/entries/${encodeURIComponent(entryId)}/publish`,
      { method: 'POST' },
    );

    revalidatePath('/');
    revalidatePath('/calendar');
    if (result.status === 'published') {
      return { status: 'success', message: 'Published to configured platforms' };
    }
    return {
      status: 'error',
      message: result.error || `Publish finished as ${result.status}`,
    };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function publishDueAction(
  _previous: ActionState,
  _formData?: FormData,
): Promise<ActionState> {
  try {
    const result = await apiFetch<{
      processed: number;
      published: number;
      failed: number;
      skipped: number;
    }>('/api/calendar/publish-due', { method: 'POST' });

    revalidatePath('/');
    revalidatePath('/calendar');
    return {
      status: 'success',
      message: `Due run: ${result.published} published, ${result.failed} failed, ${result.skipped} skipped`,
    };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

export async function syncFestivalsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const schoolId = configuredSchoolId();
  const year = Number(formData.get('bs_year'));
  if (!schoolId) return { status: 'error', message: 'SCHOOL_ID is not configured' };
  if (!Number.isInteger(year)) return { status: 'error', message: 'BS year is missing' };

  try {
    const result = await apiFetch<{ count: number }>('/api/calendar/sync-festivals', {
      method: 'POST',
      body: JSON.stringify({
        schoolId,
        bsYear: year,
        createCalendarEntries: true,
        platforms: ['facebook', 'instagram'],
        status: 'draft',
      }),
    });

    revalidatePath('/');
    revalidatePath('/calendar');
    return {
      status: 'success',
      message: `Synced ${result.count} festival event${result.count === 1 ? '' : 's'}`,
    };
  } catch (error) {
    return { status: 'error', message: errorMessage(error) };
  }
}

/* --------------------------------------------------------------- Prompts ---- */

export async function generatePromptAction(
  previous: PromptState,
  formData: FormData,
): Promise<PromptState> {
  const eventName = String(formData.get('event_name') ?? '').trim();
  if (!eventName) {
    return { ...previous, status: 'error', message: 'Pick an event or type an event name first' };
  }

  const rawTarget = String(formData.get('target') ?? 'chatgpt');
  const rawFormat = String(formData.get('format') ?? 'landscape');
  const rawTone = String(formData.get('tone') ?? 'celebratory');
  const target: PromptTarget = isPromptTarget(rawTarget) ? rawTarget : 'chatgpt';
  const format: PromptFormat = isPromptFormat(rawFormat) ? rawFormat : 'landscape';
  const tone: PromptTone = isPromptTone(rawTone) ? rawTone : 'celebratory';

  const platforms = String(formData.get('platforms') ?? '')
    .split(',')
    .map((platform) => platform.trim())
    .filter(Boolean);

  // Branding is optional: a prompt is still useful when the school row is missing.
  const branding = await getBranding();
  const variant = (previous.variant ?? 0) + 1;

  const prompt = buildPrompt({
    eventName,
    eventType: String(formData.get('event_type') ?? '') || null,
    eventDate: String(formData.get('event_date') ?? '') || null,
    description: String(formData.get('description') ?? '') || null,
    platforms,
    notes: String(formData.get('notes') ?? '') || null,
    target,
    format,
    tone,
    variant,
    branding: branding.live ? branding.data : null,
  });

  return {
    status: 'success',
    message: variant > 1 ? `Regenerated (variation ${variant})` : 'Prompt generated',
    prompt,
    variant,
    target,
    eventName,
  };
}
