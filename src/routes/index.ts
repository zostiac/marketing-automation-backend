import { Router } from "express";
import { SchoolController } from "../controllers/SchoolController";
import { EventController } from "../controllers/EventController";
import { DesignController } from "../controllers/DesignController";
import { JobController } from "../controllers/JobController";
import { AdminController } from "../controllers/AdminController";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { SocialMediaController } from "../controllers/SocialMediaController";
import { ContentCalendarController } from "../controllers/ContentCalendarController";
import { DashboardController } from "../controllers/DashboardController";

const router = Router();

// School
router.get("/school/profile/:id", SchoolController.getSchoolProfile);
router.put("/school/profile/:id", SchoolController.updateSchoolProfile);
router.get("/school/branding/:id", SchoolController.getBranding);

// Events
router.post("/events", EventController.createEvent);
router.get("/events/:schoolId/today", EventController.getTodayEvents);
router.get("/events/:id", EventController.getEvent);
router.put("/events/:id", EventController.updateEvent);
router.delete("/events/:id", EventController.deleteEvent);

// Designs
router.post("/designs/request", DesignController.requestDesign);
router.get("/designs/:id/status", DesignController.getDesignStatus);
router.get("/designs/:id/result", DesignController.getDesignResult);

// Jobs
router.get("/jobs/:id/status", JobController.getJobStatus);
router.post("/jobs/:id/retry", JobController.retryJob);

// Admin endpoints
router.get("/admin/stats", AdminController.getSystemStats);
router.get("/admin/jobs/recent", AdminController.getRecentJobs);
router.get("/admin/jobs/failed", AdminController.getFailedJobs);
router.get("/admin/metrics", AdminController.getMetrics);

// Analytics
router.get(
  "/analytics/designs/:schoolId",
  AnalyticsController.getDesignAnalytics,
);
router.get(
  "/analytics/success-rate/:schoolId",
  AnalyticsController.getSuccessRateByEventType,
);
router.get(
  "/analytics/top-events/:schoolId",
  AnalyticsController.getTopPerformingEvents,
);

// Social Media
router.post("/social/publish", SocialMediaController.publishDesign);
router.post("/social/publish-batch", SocialMediaController.publishBatch);

// Content Calendar
router.get("/calendar/:schoolId", ContentCalendarController.getCalendar);
router.post("/calendar/entry", ContentCalendarController.createEntry);
router.post(
  "/calendar/schedule-publish",
  ContentCalendarController.schedulePublishing,
);

// Dashboard-compatible endpoints (used by Next.js frontend src/lib/data.ts)
// These are the routes the Vercel dashboard probes for live data.
// They intentionally have no :schoolId param so the frontend can call them
// without knowing the school; they return aggregated or provider-backed data.
router.get("/occasions", DashboardController.getOccasions);
router.get("/designs", DashboardController.getDesigns);
router.get("/channels", DashboardController.getChannels);
router.get("/runs", DashboardController.getRuns);
router.get("/branding", DashboardController.getBranding);
router.get("/stats", DashboardController.getStats);

// Also expose dashboard design mutation helpers for future client actions
router.post("/designs/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    // Mark job approved and asset quality approved if present
    const { db } = await import("../config/database");
    await db.query(`UPDATE design_jobs SET status = 'APPROVED', completed_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
    await db.query(`UPDATE assets SET quality_status = 'APPROVED', approved_at = CURRENT_TIMESTAMP WHERE design_job_id = $1`, [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
router.post("/designs/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { db } = await import("../config/database");
    await db.query(`UPDATE assets SET quality_status = 'NEEDS_REVISION' WHERE design_job_id = $1`, [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});
router.post("/designs/:id/regenerate", async (req, res) => {
  try {
    const { id } = req.params;
    const { db } = await import("../config/database");
    const { designQueue } = await import("../queues/designQueue");
    const { config } = await import("../config/env");
    const jobRow = await db.query(`SELECT design_request_id FROM design_jobs WHERE id = $1`, [id]);
    if (!jobRow.rows.length) return res.status(404).json({ error: "Design not found" });
    await db.query(`UPDATE design_jobs SET status = 'QUEUED', retry_count = 0, error_message = NULL WHERE id = $1`, [id]);
    await designQueue.add(
      { jobId: id, designRequestId: jobRow.rows[0].design_request_id },
      { attempts: config.max_retries, backoff: { type: "exponential", delay: 2000 } },
    );
    res.json({ ok: true, status: "QUEUED" });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

export default router;
