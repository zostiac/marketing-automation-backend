import { Request, Response } from "express";
import { db } from "../config/database";
import { config } from "../config/env";
import { NepaliCalendarProvider } from "../services/NepaliCalendarProvider";

/**
 * Dashboard-compatible controller.
 * Implements the 6 endpoints that the Next.js frontend expects:
 *   GET /api/occasions
 *   GET /api/designs
 *   GET /api/channels
 *   GET /api/runs
 *   GET /api/branding
 *   GET /api/stats
 *
 * All handlers degrade gracefully: if the database is unreachable they still
 * return valid payloads (provider-backed or empty) so the dashboard can render
 * instead of showing a 500. The frontend's apiFetchOr fallback handles full
 * backend outages, but these handlers handle partial DB outages.
 */

type OccasionStatus = "detected" | "upcoming" | "in_progress" | "completed" | "skipped";
interface Occasion {
  id: string;
  name: string;
  nameNepali?: string;
  date: string;
  status: OccasionStatus;
  source: "auto" | "manual";
  description?: string;
  designCount: number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32) || "occasion";
}

function toKathmanduISODate(date: Date): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "01";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function mapOccasionStatus(dateAd: string, todayAd: string): OccasionStatus {
  if (dateAd === todayAd) return "detected";
  if (dateAd > todayAd) return "upcoming";
  // Past festivals are shown as completed in the dashboard's "Past" section
  return "completed";
}

export class DashboardController {
  /**
   * GET /api/occasions
   * Returns auto-detected Nepali festivals (via provider) + manual events from DB.
   * Query params supported: ?days=60 (window size), ?includePast=true
   */
  static async getOccasions(req: Request, res: Response) {
    try {
      const provider = new NepaliCalendarProvider();
      const todayAd = toKathmanduISODate(new Date());

      const daysParam = req.query.days ? Number(req.query.days) : 90;
      const days = Number.isInteger(daysParam) && daysParam >= 1 && daysParam <= 366 ? daysParam : 90;
      const includePastParam = req.query.includePast;
      const includePast = includePastParam === "true" || includePastParam === "1";

      // Window: if includePast, last 30 days + next `days`; else today + next `days`
      const startDate = includePast
        ? (() => {
            const d = new Date();
            // compute 30 days ago in Kathmandu
            const parts = new Intl.DateTimeFormat("en-US", {
              timeZone: "Asia/Kathmandu",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
              .formatToParts(new Date(Date.now() - 30 * 86_400_000))
              .reduce((acc: any, p) => ({ ...acc, [p.type]: p.value }), {});
            return `${parts.year}-${parts.month}-${parts.day}`;
          })()
        : todayAd;

      // Compute end date = startDate + days
      // Reuse provider's internal logic via getOccasionsBetween after deriving endDate string
      // Simpler: ask provider for upcoming window plus manual past window separately
      let auto: ReturnType<NepaliCalendarProvider["getOccasionsBetween"]> = [];
      try {
        if (includePast) {
          // Get 30 days past + 90 days future
          const pastProvider = new NepaliCalendarProvider();
          const pastStart = (() => {
            const d = new Date(Date.now() - 30 * 86_400_000);
            return toKathmanduISODate(d);
          })();
          const futureEnd = (() => {
            const start = new Date();
            const end = new Date(start.getTime() + days * 86_400_000);
            return toKathmanduISODate(end);
          })();
          auto = pastProvider.getOccasionsBetween(pastStart, futureEnd);
        } else {
          auto = provider.getUpcomingOccasions(days);
        }
      } catch {
        auto = [];
      }

      const autoOccasions: Occasion[] = auto.map((o) => ({
        id: `occ_${o.date_ad}_${slugify(o.name)}`,
        name: o.name,
        nameNepali: o.name_np,
        date: o.date_ad,
        status: mapOccasionStatus(o.date_ad, todayAd),
        source: "auto" as const,
        description: o.description,
        designCount: 0, // auto festivals have no design count until synced
      }));

      // Merge manual events from DB if available
      let manualOccasions: Occasion[] = [];
      try {
        if (config.database_url) {
          // Fetch recent + upcoming manual events (event_type != nepal_festival or all)
          const result = await db.query(
            `SELECT e.id, e.name, e.description, e.event_date::text as event_date, e.event_type,
                    COUNT(dr.id) as design_count
             FROM events e
             LEFT JOIN design_requests dr ON dr.event_id = e.id
             WHERE e.event_date >= CURRENT_DATE - INTERVAL '30 days'
               AND e.event_date <= CURRENT_DATE + INTERVAL '90 days'
             GROUP BY e.id
             ORDER BY e.event_date ASC
             LIMIT 100`,
          );
          manualOccasions = result.rows
            .filter((row: any) => {
              // Avoid duplicating auto festivals already present (same name+date)
              const rowDate: string = row.event_date?.slice(0, 10) ?? "";
              const rowSlug = slugify(row.name);
              return !autoOccasions.some(
                (a) => a.date === rowDate && slugify(a.name) === rowSlug,
              );
            })
            .map((row: any) => {
              const date: string = row.event_date?.slice(0, 10) ?? todayAd;
              // Manual campaigns often mapped as in_progress if today or very close; keep simple
              const status: OccasionStatus =
                date === todayAd ? "in_progress" : mapOccasionStatus(date, todayAd);
              return {
                id: row.id,
                name: row.name,
                date,
                status,
                source: "manual" as const,
                description: row.description || undefined,
                designCount: Number(row.design_count) || 0,
              };
            });
        }
      } catch {
        // DB unavailable - just return auto occasions
        manualOccasions = [];
      }

      const merged = [...autoOccasions, ...manualOccasions].sort(
        (a, b) => +new Date(a.date) - +new Date(b.date),
      );

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = merged.filter((o) => {
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      });

      res.json(deduped);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /** GET /api/designs */
  static async getDesigns(_req: Request, res: Response) {
    try {
      if (!config.database_url) {
        res.json([]);
        return;
      }
      let rows: any[] = [];
      try {
        const result = await db.query(
          `SELECT dj.id, dj.status, dj.prompt, dj.error_message, dj.retry_count,
                  dj.generation_time_ms, dj.created_at, dj.completed_at,
                  dr.design_type, dr.event_id, e.name as event_name,
                  a.storage_location, a.quality_status, a.file_size_bytes
           FROM design_jobs dj
           JOIN design_requests dr ON dj.design_request_id = dr.id
           LEFT JOIN events e ON dr.event_id = e.id
           LEFT JOIN assets a ON a.design_job_id = dj.id
           ORDER BY dj.created_at DESC
           LIMIT 100`,
        );
        rows = result.rows;
      } catch (err) {
        // Degrade gracefully — fresh DB, missing tables, or transient connection failure
        // should not make the dashboard show a 500; return empty list as live data.
        console.warn("getDesigns DB fallback:", String(err).slice(0, 300));
        res.json([]);
        return;
      }

      const mapped = rows.map((row) => {
        let status: string = row.status || "QUEUED";
        const q = (row.quality_status || "").toString();

        // Map backend -> frontend DesignStatus
        let frontendStatus: "generating" | "pending_approval" | "approved" | "rejected" | "failed" = "generating";
        if (status === "FAILED") frontendStatus = "failed";
        else if (status === "APPROVED" && q === "PENDING_REVIEW") frontendStatus = "pending_approval";
        else if (status === "APPROVED" && q === "NEEDS_REVISION") frontendStatus = "rejected";
        else if (status === "APPROVED") frontendStatus = "approved";
        else if (status === "QUEUED" || status === "PROCESSING" || status === "PENDING") frontendStatus = "generating";
        else if (q === "APPROVED") frontendStatus = "approved";
        else frontendStatus = "generating";

        const createdAt: string =
          row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString();
        const approvedAt: string | undefined =
          row.completed_at && frontendStatus === "approved"
            ? row.completed_at instanceof Date
              ? row.completed_at.toISOString()
              : new Date(row.completed_at).toISOString()
            : undefined;

        // Provide imageUrl via backend asset endpoint proxied through frontend
        // The frontend's proxy is at /api/backend/api/designs/:id/result, but a relative
        // backend path also works when the dashboard is server-rendered via apiFetch.
        // We expose a frontend-proxy-friendly path so the browser can load it.
        const imageUrl: string | undefined = row.storage_location
          ? `/api/backend/api/designs/${row.id}/result`
          : undefined;

        return {
          id: row.id,
          occasionId: row.event_id || "unknown",
          occasionName: row.event_name || "Unlinked occasion",
          title: row.event_name ? `${row.event_name} — ${row.design_type || "poster"}` : `Design ${String(row.id).slice(0, 8)}`,
          status: frontendStatus,
          imageUrl,
          prompt: row.prompt || undefined,
          createdAt,
          approvedAt,
          error: row.error_message || undefined,
          version: (Number(row.retry_count) || 0) + 1,
        };
      });

      res.json(mapped);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /** GET /api/channels */
  static async getChannels(_req: Request, res: Response) {
    try {
      const channels = [];

      // Email
      const emailUser = process.env.EMAIL_USER || "";
      const emailConfigured = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD;
      channels.push({
        id: "ch_email",
        name: "Gmail",
        kind: "email",
        status: emailConfigured ? "connected" : "disconnected",
        detail: emailUser || "Not configured",
        lastUsedAt: undefined,
      });

      // Facebook
      const fbConfigured = !!process.env.FACEBOOK_ACCESS_TOKEN && !!process.env.FACEBOOK_PAGE_ID;
      channels.push({
        id: "ch_fb",
        name: "Facebook Page",
        kind: "facebook",
        status: fbConfigured ? "connected" : "disconnected",
        detail: fbConfigured ? process.env.FACEBOOK_PAGE_ID || "Connected" : "Not linked",
        lastUsedAt: undefined,
      });

      // Instagram
      const igConfigured = !!process.env.INSTAGRAM_ACCESS_TOKEN && !!process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
      channels.push({
        id: "ch_ig",
        name: "Instagram",
        kind: "instagram",
        status: igConfigured ? "connected" : "disconnected",
        detail: igConfigured ? "Connected" : "Not linked",
        lastUsedAt: undefined,
      });

      // WhatsApp (not yet implemented in SocialMediaService but frontend expects it)
      const waConfigured = !!process.env.WHATSAPP_TOKEN;
      channels.push({
        id: "ch_wa",
        name: "WhatsApp Business",
        kind: "whatsapp",
        status: waConfigured ? "connected" : "disconnected",
        detail: waConfigured ? "Connected" : "Not linked",
      });

      // Try to enrich with DB school social_media_info if available
      try {
        if (config.database_url) {
          const result = await db.query(`SELECT social_media_info FROM schools LIMIT 1`);
          if (result.rows.length && result.rows[0].social_media_info) {
            const info = result.rows[0].social_media_info;
            // info may contain last sync timestamps etc - we could map but keep simple
            // Don't override env-based connectivity, just enrich detail if present
            void info;
          }
        }
      } catch {
        // ignore
      }

      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /** GET /api/runs */
  static async getRuns(_req: Request, res: Response) {
    try {
      if (!config.database_url) {
        res.json([]);
        return;
      }
      let rows: any[] = [];
      try {
        const result = await db.query(
          `SELECT dj.id, dj.status, dj.error_message, dj.generation_time_ms, dj.created_at, dj.started_at,
                  dr.design_type, e.name as event_name
           FROM design_jobs dj
           LEFT JOIN design_requests dr ON dj.design_request_id = dr.id
           LEFT JOIN events e ON dr.event_id = e.id
           ORDER BY dj.created_at DESC
           LIMIT 100`,
        );
        rows = result.rows;
      } catch (err) {
        console.warn("getRuns DB fallback:", String(err).slice(0, 300));
        res.json([]);
        return;
      }

      const runs = rows.map((row) => {
        let status: "success" | "failed" | "running" = "running";
        if (row.status === "APPROVED") status = "success";
        else if (row.status === "FAILED") status = "failed";
        else if (row.status === "QUEUED" || row.status === "PROCESSING") status = "running";

        const startedAt: string =
          row.started_at || row.created_at
            ? (row.started_at || row.created_at) instanceof Date
              ? (row.started_at || row.created_at).toISOString()
              : new Date(row.started_at || row.created_at).toISOString()
            : new Date().toISOString();

        return {
          id: row.id,
          occasionName: row.event_name || row.design_type || "Unknown occasion",
          step: row.design_type ? `Generate ${row.design_type}` : "Generate design",
          status,
          startedAt,
          durationMs: row.generation_time_ms ? Number(row.generation_time_ms) : undefined,
          message: row.error_message || undefined,
        };
      });

      // If no runs in DB, still return empty array (frontend will show empty state, not error)
      res.json(runs);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /** GET /api/branding */
  static async getBranding(_req: Request, res: Response) {
    try {
      // Try DB first
      try {
        if (config.database_url) {
          const result = await db.query(`SELECT * FROM schools LIMIT 1`);
          if (result.rows.length) {
            const s = result.rows[0];
            const brandColors = s.brand_colors || {};
            const social = s.social_media_info || {};
            res.json({
              schoolName: s.name || "Amar English School",
              tagline: s.tagline || "Learning today, leading tomorrow",
              primaryColor: brandColors.primary || brandColors.primary_color || "#1d4ed8",
              secondaryColor: brandColors.secondary || brandColors.secondary_color || "#f59e0b",
              logoUrl: s.official_logo_url || undefined,
              address: s.location || "Kathmandu, Bagmati Province, Nepal",
              phone: social.phone || "+977-1-4XXXXXX",
              email: social.email || process.env.EMAIL_USER || "info@amarenglishschool.edu.np",
            });
            return;
          }
        }
      } catch {
        // fall through to default
      }

      // Default branding (matches frontend sample-data)
      res.json({
        schoolName: "Amar English School",
        tagline: "Learning today, leading tomorrow",
        primaryColor: "#1d4ed8",
        secondaryColor: "#f59e0b",
        logoUrl: undefined,
        address: "Kathmandu, Bagmati Province, Nepal",
        phone: "+977-1-4XXXXXX",
        email: process.env.EMAIL_USER || "info@amarenglishschool.edu.np",
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /** GET /api/stats */
  static async getStats(_req: Request, res: Response) {
    try {
      let upcomingOccasions = 0;
      let pendingApproval = 0;
      let postersThisMonth = 0;
      let lastEmailSentAt: string | null = null;

      // Upcoming occasions from provider (60 days)
      try {
        const provider = new NepaliCalendarProvider();
        const upcoming = provider.getUpcomingOccasions(60);
        upcomingOccasions = upcoming.length;
      } catch {
        upcomingOccasions = 4; // fallback
      }

      // Try DB for real counts
      try {
        if (config.database_url) {
          // Pending approval: design_jobs with status APPROVED but asset quality PENDING_REVIEW
          // Fallback to counting QUEUED/PROCESSING as pending-ish, and APPROVED as posters
          const pendingResult = await db.query(
            `SELECT COUNT(*) as cnt FROM design_jobs WHERE status = 'QUEUED' OR status = 'PROCESSING'`,
          ).catch(() => ({ rows: [{ cnt: "0" }] }));
          pendingApproval = Number(pendingResult.rows[0]?.cnt || 0);

          // Try assets pending as well
          try {
            const assetPending = await db.query(`SELECT COUNT(*) as cnt FROM assets WHERE quality_status = 'PENDING_REVIEW'`);
            const assetCnt = Number(assetPending.rows[0]?.cnt || 0);
            pendingApproval = Math.max(pendingApproval, assetCnt);
          } catch {}

          const monthResult = await db.query(
            `SELECT COUNT(*) as cnt FROM design_jobs WHERE created_at >= date_trunc('month', CURRENT_DATE)`,
          ).catch(() => ({ rows: [{ cnt: "0" }] }));
          postersThisMonth = Number(monthResult.rows[0]?.cnt || 0);

          // Last email from system_logs
          try {
            const emailResult = await db.query(
              `SELECT created_at FROM system_logs WHERE service = 'email' OR message ILIKE '%email%' ORDER BY created_at DESC LIMIT 1`,
            );
            if (emailResult.rows.length) {
              const d = emailResult.rows[0].created_at;
              lastEmailSentAt = d instanceof Date ? d.toISOString() : new Date(d).toISOString();
            }
          } catch {}
        }
      } catch {
        // keep provider-based defaults
      }

      res.json({
        upcomingOccasions,
        pendingApproval,
        postersThisMonth,
        lastEmailSentAt,
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}
