'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, configuredSchoolId } from '@/lib/api';

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
