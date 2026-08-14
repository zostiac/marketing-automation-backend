'use client';

import { useActionState, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { generatePromptAction } from '@/app/actions';
import { Button, Card, CardHeader } from '@/components/ui';
import {
  FORMAT_LABELS,
  INITIAL_PROMPT_STATE,
  PROMPT_FORMATS,
  PROMPT_TARGETS,
  PROMPT_TONES,
  TARGET_LABELS,
  TONE_LABELS,
  type PromptState,
} from '@/lib/prompt';

export interface PromptEventOption {
  id: string;
  name: string;
  eventType?: string | null;
  eventDate?: string | null;
  description?: string | null;
  platforms: string[];
  source: string;
}

const CUSTOM = '__custom__';

const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';
const label = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground';

function PromptResult({ state }: { state: PromptState }) {
  const [copied, setCopied] = useState(false);
  const [seenPrompt, setSeenPrompt] = useState(state.prompt);

  // A newly generated prompt resets the copy affordance. Adjusted during render
  // rather than in an effect, matching the pattern used by job-actions.tsx.
  if (seenPrompt !== state.prompt) {
    setSeenPrompt(state.prompt);
    if (copied) setCopied(false);
  }

  if (state.status === 'error') {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-danger">{state.message}</p>
      </div>
    );
  }

  if (!state.prompt) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
        <Wand2 className="h-6 w-6 text-muted-foreground/60" aria-hidden />
        <p className="text-sm text-muted-foreground">No prompt yet.</p>
        <p className="text-xs text-muted-foreground/70">
          Choose an event and options, then select Generate prompt.
        </p>
      </div>
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(state.prompt ?? '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {state.eventName} · {state.target ? TARGET_LABELS[state.target] : 'prompt'}
          {state.variant ? ` · variation ${state.variant}` : ''}
        </p>
        <Button onClick={copy} variant="secondary" title="Copy prompt to clipboard">
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {copied ? 'Copied' : 'Copy prompt'}
        </Button>
      </div>
      <pre className="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 px-4 py-3 font-sans text-xs leading-5 text-foreground">
        {state.prompt}
      </pre>
    </div>
  );
}

export function PromptStudio({
  events,
  initialEventId,
}: {
  events: PromptEventOption[];
  /** Deep link from the calendar's design-options dialog. */
  initialEventId?: string;
}) {
  const [state, action, pending] = useActionState(generatePromptAction, INITIAL_PROMPT_STATE);
  const [selectedId, setSelectedId] = useState(
    initialEventId && events.some((event) => event.id === initialEventId)
      ? initialEventId
      : (events[0]?.id ?? CUSTOM),
  );

  const selected = useMemo(
    () => events.find((event) => event.id === selectedId),
    [events, selectedId],
  );
  const custom = !selected;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader
            title="Prompt builder"
            icon={<Wand2 className="h-4 w-4" />}
            description="Nothing is generated until you ask for it."
          />
          <form action={action} className="space-y-4 p-5">
            <div>
              <label className={label} htmlFor="prompt-event">
                Event
              </label>
              <select
                id="prompt-event"
                className={field}
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name} · {event.source}
                  </option>
                ))}
                <option value={CUSTOM}>Custom event…</option>
              </select>
            </div>

            {custom ? (
              <>
                <div>
                  <label className={label} htmlFor="prompt-name">
                    Event name
                  </label>
                  <input id="prompt-name" name="event_name" className={field} placeholder="Annual Sports Day" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label} htmlFor="prompt-type">
                      Event type
                    </label>
                    <input id="prompt-type" name="event_type" className={field} placeholder="school" />
                  </div>
                  <div>
                    <label className={label} htmlFor="prompt-date">
                      Event date
                    </label>
                    <input id="prompt-date" name="event_date" type="date" className={field} />
                  </div>
                </div>
                <div>
                  <label className={label} htmlFor="prompt-description">
                    Context
                  </label>
                  <textarea
                    id="prompt-description"
                    name="description"
                    rows={3}
                    className={field}
                    placeholder="What the audience should know about this event."
                  />
                </div>
                <input type="hidden" name="platforms" value="facebook, instagram" />
              </>
            ) : (
              <>
                <input type="hidden" name="event_name" value={selected.name} />
                <input type="hidden" name="event_type" value={selected.eventType ?? ''} />
                <input type="hidden" name="event_date" value={selected.eventDate ?? ''} />
                <input type="hidden" name="description" value={selected.description ?? ''} />
                <input type="hidden" name="platforms" value={selected.platforms.join(', ')} />
                <dl className="space-y-1 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                  {selected.eventDate ? <div>Date · {selected.eventDate}</div> : null}
                  {selected.eventType ? <div>Type · {selected.eventType.replaceAll('_', ' ')}</div> : null}
                  {selected.platforms.length ? <div>Channels · {selected.platforms.join(', ')}</div> : null}
                </dl>
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="prompt-target">
                  Target tool
                </label>
                <select id="prompt-target" name="target" className={field} defaultValue="chatgpt">
                  {PROMPT_TARGETS.map((target) => (
                    <option key={target} value={target}>
                      {TARGET_LABELS[target]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label} htmlFor="prompt-format">
                  Format
                </label>
                <select id="prompt-format" name="format" className={field} defaultValue="landscape">
                  {PROMPT_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {FORMAT_LABELS[format]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={label} htmlFor="prompt-tone">
                Tone
              </label>
              <select id="prompt-tone" name="tone" className={field} defaultValue="celebratory">
                {PROMPT_TONES.map((tone) => (
                  <option key={tone} value={tone}>
                    {TONE_LABELS[tone]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={label} htmlFor="prompt-notes">
                Extra instructions (optional)
              </label>
              <textarea
                id="prompt-notes"
                name="notes"
                rows={2}
                className={field}
                placeholder="Mention the 40th anniversary, keep space for a QR code…"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Button type="submit" variant="primary" size="md" disabled={pending}>
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : state.prompt ? (
                  <RefreshCw className="h-4 w-4" aria-hidden />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden />
                )}
                {pending ? 'Generating…' : state.prompt ? 'Generate again' : 'Generate prompt'}
              </Button>
              {state.status === 'success' && state.message ? (
                <span className="text-[11px] text-success">{state.message}</span>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader
            title="Generated prompt"
            icon={<Sparkles className="h-4 w-4" />}
            description="Copy this into your image tool, or queue an in-app design job instead."
          />
          <PromptResult state={state} />
        </Card>
      </div>
    </div>
  );
}
