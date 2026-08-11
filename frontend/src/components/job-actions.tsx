'use client';

import { useActionState } from 'react';
import {
  requestDesignAction,
  retryJobAction,
  type ActionState,
} from '@/app/actions';
import { Button } from './ui';

const INITIAL_STATE: ActionState = { status: 'idle' };

function Result({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <span
      role="status"
      title={state.message}
      className={`max-w-44 truncate text-[11px] ${
        state.status === 'error'
          ? 'text-red-600 dark:text-red-400'
          : 'text-emerald-600 dark:text-emerald-400'
      }`}
    >
      {state.message}
    </span>
  );
}

export function RequestDesignButton({
  eventId,
  designType = 'poster',
}: {
  eventId: string;
  designType?: string;
}) {
  const [state, action, pending] = useActionState(requestDesignAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="design_type" value={designType} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Queuing…' : 'Generate design'}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function RetryJobButton({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(retryJobAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="job_id" value={jobId} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? 'Queuing…' : '↻ Retry job'}
      </Button>
      <Result state={state} />
    </form>
  );
}
