'use client';

import { useActionState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import {
  requestDesignAction,
  retryJobAction,
  type ActionState,
} from '@/app/actions';
import { Button } from './ui';

const INITIAL_STATE: ActionState = { status: 'idle' };

function Result({ state }: { state: ActionState }) {
  if (!state.message) return null;
  const error = state.status === 'error';
  return (
    <span
      role="status"
      title={state.message}
      className={`inline-flex max-w-44 items-center gap-1 truncate text-[11px] ${
        error ? 'text-danger' : 'text-success'
      }`}
    >
      {error ? (
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span className="truncate">{state.message}</span>
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
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        )}
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
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? 'Queuing…' : 'Retry job'}
      </Button>
      <Result state={state} />
    </form>
  );
}
