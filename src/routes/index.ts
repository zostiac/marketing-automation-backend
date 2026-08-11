import { Router } from "express";
import { SchoolController } from "../controllers/SchoolController";
import { EventController } from "../controllers/EventController";
import { DesignController } from "../controllers/DesignController";
import { JobController } from "../controllers/JobController";
import { AdminController } from "../controllers/AdminController";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { SocialMediaController } from "../controllers/SocialMediaController";
import { ContentCalendarController } from "../controllers/ContentCalendarController";

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

export default router;
