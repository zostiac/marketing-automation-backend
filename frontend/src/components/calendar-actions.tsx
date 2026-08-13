'use client';

import { useActionState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  publishDueAction,
  publishEntryAction,
  syncFestivalsAction,
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
      className={`inline-flex max-w-56 items-center gap-1 truncate text-[11px] ${
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

export function PublishEntryButton({ entryId }: { entryId: string }) {
  const [state, action, pending] = useActionState(publishEntryAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="entry_id" value={entryId} />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? 'Publishing…' : 'Publish now'}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function PublishDueButton() {
  const [state, action, pending] = useActionState(publishDueAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Send className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? 'Running…' : 'Publish due entries'}
      </Button>
      <Result state={state} />
    </form>
  );
}

export function SyncFestivalsButton({ bsYear }: { bsYear: number }) {
  const [state, action, pending] = useActionState(syncFestivalsAction, INITIAL_STATE);

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="bs_year" value={bsYear} />
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        )}
        {pending ? 'Syncing…' : `Sync BS ${bsYear} festivals`}
      </Button>
      <Result state={state} />
    </form>
  );
}
