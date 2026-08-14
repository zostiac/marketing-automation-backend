'use client';

import { useState } from 'react';
import { Check, Copy, ImageIcon, Sparkles, X } from 'lucide-react';
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

function eventBrief({ eventName, description, eventType, eventDate, platforms }: Omit<DesignOptionsProps, 'eventId'>) {
  return [
    `Event: ${eventName}`,
    eventType ? `Type: ${eventType}` : null,
    eventDate ? `Date: ${eventDate}` : null,
    description ? `Context: ${description}` : null,
    platforms.length ? `Channels: ${platforms.join(', ')}` : null,
  ].filter(Boolean).join('\n');
}

function createPrompts(props: DesignOptionsProps) {
  const brief = eventBrief(props);
  return {
    chatgpt: `Create a polished, ready-to-publish social media poster for a Nepal-based school.\n\n${brief}\n\nCanvas: 1200 × 630 px (landscape).\nStyle: warm, professional, celebratory, visually clear, and suitable for parents and students. Use strong hierarchy with the event name as the focal point. Include subtle Nepal-inspired cultural details only where relevant. Leave clean, intentional space for the school logo. Do not add a watermark. Make all on-image text accurate and readable.`,
    gemini: `Design a premium 1200 × 630 px landscape social-media graphic for a Nepal-based school.\n\n${brief}\n\nArt direction: editorial school campaign, refined colour palette, natural visual depth, crisp typography, clear focal point on the event name, generous logo-safe space, and a composed layout that stays readable on mobile. Use authentic cultural cues only if they fit the event. Avoid watermarks, gibberish text, crowded layouts, and generic stock-photo styling. Output the finished graphic only.`,
  };
}

function CopyPrompt({ label, prompt }: { label: string; prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/45 px-3 py-2">
        <h4 className="text-xs font-semibold text-foreground">{label}</h4>
        <Button onClick={copy} variant="secondary" title={`Copy ${label} prompt`}>
          {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap px-3 py-3 text-xs leading-5 text-muted-foreground">{prompt}</p>
    </article>
  );
}

export function DesignOptions(props: DesignOptionsProps) {
  const [open, setOpen] = useState(false);
  const prompts = createPrompts(props);

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
                <p className="mt-1 text-sm text-muted-foreground">Choose an automated design, or take a tailored prompt to your preferred tool.</p>
              </div>
              <Button variant="ghost" onClick={() => setOpen(false)} title="Close design options">
                <X className="h-4 w-4" aria-hidden />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <div className="space-y-5 p-5">
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

              <div>
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-foreground">Prompts only</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Copy a platform-specific brief, then paste it into ChatGPT or Gemini.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <CopyPrompt label="ChatGPT image prompt" prompt={prompts.chatgpt} />
                  <CopyPrompt label="Gemini image prompt" prompt={prompts.gemini} />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
