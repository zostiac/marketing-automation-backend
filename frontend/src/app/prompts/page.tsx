import { Info } from 'lucide-react';
import { ConnectionBanner } from '@/components/connection-banner';
import { PromptStudio, type PromptEventOption } from '@/components/prompt-studio';
import { isApiConfigured, isSchoolConfigured } from '@/lib/api';
import { getCalendar, getTodayEvents } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string | string[] }>;
}) {
  const requested = (await searchParams).event;
  const initialEventId = Array.isArray(requested) ? requested[0] : requested;
  const [calendar, todayEvents] = await Promise.all([getCalendar(), getTodayEvents()]);

  const seen = new Set<string>();
  const options: PromptEventOption[] = [];

  for (const event of todayEvents.data) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    options.push({
      id: event.id,
      name: event.name,
      eventType: event.event_type,
      eventDate: event.event_date,
      description: event.description,
      platforms: [],
      source: 'today',
    });
  }

  for (const entry of calendar.data) {
    if (seen.has(entry.event_id)) continue;
    seen.add(entry.event_id);
    options.push({
      id: entry.event_id,
      name: entry.name || `Event ${entry.event_id.slice(0, 8)}`,
      eventType: entry.event_type,
      eventDate: entry.event_date ?? entry.scheduled_publish_date,
      description: entry.description,
      platforms: entry.platforms,
      source: 'calendar',
    });
  }

  return (
    <>
      <ConnectionBanner
        live={calendar.live}
        error={calendar.error}
        configured={isApiConfigured()}
        requiresSchool
        schoolConfigured={isSchoolConfigured()}
      />

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Prompts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build an image prompt for a scheduled event on demand — pick the tool, format and tone,
          then generate.
        </p>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Prompts are composed here rather than shipped alongside every calendar entry, so each one
          reflects the current school branding and the choices you make below. Generate again for a
          different wording of the same brief.
        </p>
      </div>

      <PromptStudio events={options} initialEventId={initialEventId} />
    </>
  );
}
