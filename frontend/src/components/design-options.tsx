'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ImageIcon, Sparkles, Wand2, X } from 'lucide-react';
import { RequestDesignButton } from '@/components/job-actions';
import { Button } from '@/components/ui';

type DesignOptionsProps = {
  eventId: string;
  eventName: string;
  description?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  platforms: string[];
  canGenerate?: boolean;
};

export function DesignOptions(props: DesignOptionsProps) {
  const [open, setOpen] = useState(false);
  const promptHref = `/prompts?event=${encodeURIComponent(props.eventId)}`;

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Design options
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="design-options-title" className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-violet">Creative handoff</p>
                <h3 id="design-options-title" className="mt-1 text-lg font-semibold text-foreground">{props.eventName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Generate a design here, or build a prompt for your own tool.</p>
              </div>
              <Button variant="ghost" onClick={() => setOpen(false)} title="Close design options">
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-violet/25 bg-violet-muted/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><ImageIcon className="h-4 w-4 text-violet" aria-hidden /> Generate in this app</h4>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Send this event to the connected image-generation service.</p>
                  </div>
                  {props.canGenerate === false ? (
                    <Button variant="primary" disabled title="Connect the live backend to generate a design">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden />
                      Generate design
                    </Button>
                  ) : (
                    <RequestDesignButton eventId={props.eventId} />
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Wand2 className="h-4 w-4 text-muted-foreground" aria-hidden /> Build a prompt</h4>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Open the Prompts section to choose a tool, format and tone, then generate a brief for this event.
                    </p>
                  </div>
                  <Link
                    href={promptHref}
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Open prompt builder
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
