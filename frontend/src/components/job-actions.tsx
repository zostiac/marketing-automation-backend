'use client';

import { useEffect, useState, useActionState } from 'react';
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  deleteFailedJobsAction,
  deleteJobAction,
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

/** Two-step delete: the first click arms the button, the second submits. */
function useArmedConfirm(resetKey: unknown, timeoutMs = 4000) {
  const [armed, setArmed] = useState(false);
  const [seenKey, setSeenKey] = useState(resetKey);

  // Disarm as soon as the action reports back, adjusting state during render
  // rather than in an effect (no cascading re-render).
  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    if (armed) setArmed(false);
  }

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), timeoutMs);
    return () => clearTimeout(timer);
  }, [armed, timeoutMs]);

  return [armed, setArmed] as const;
}

export function DeleteJobButton({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(deleteJobAction, INITIAL_STATE);
  const [armed, setArmed] = useArmedConfirm(state);

  if (state.status === 'success') {
    return <Result state={state} />;
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="job_id" value={jobId} />
      <Button
        type={armed ? 'submit' : 'button'}
        variant="danger"
        disabled={pending}
        title={armed ? 'Click again to permanently delete this job' : 'Delete this failed job'}
        onClick={armed ? undefined : () => setArmed(true)}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? 'Deleting…' : armed ? 'Confirm delete' : 'Delete'}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function DeleteAllFailedJobsButton({ count }: { count: number }) {
  const [state, action, pending] = useActionState(deleteFailedJobsAction, INITIAL_STATE);
  const [armed, setArmed] = useArmedConfirm(state);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button
        type={armed ? 'submit' : 'button'}
        variant="danger"
        disabled={pending || count === 0}
        title={
          count === 0
            ? 'No failed jobs to delete'
            : armed
              ? `Click again to delete all ${count} failed jobs`
              : `Delete all ${count} failed jobs`
        }
        onClick={armed ? undefined : () => setArmed(true)}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending
          ? 'Deleting…'
          : armed
            ? `Confirm delete ${count}`
            : `Clear failed (${count})`}
      </Button>
      <Result state={state} />
    </form>
  );
}
