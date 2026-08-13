import { Router } from "express";
import { SchoolController } from "../controllers/SchoolController";
import { EventController } from "../controllers/EventController";
import { DesignController } from "../controllers/DesignController";
import { JobController } from "../controllers/JobController";
import { AdminController } from "../controllers/AdminController";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { SocialMediaController } from "../controllers/SocialMediaController";
import { ContentCalendarController } from "../controllers/ContentCalendarController";
import { authenticate } from "../middleware/authentication";
import {
  calendarEntrySchema,
  designRequestSchema,
  eventCreateSchema,
  schedulePublishSchema,
  schoolCreateSchema,
  socialPublishBatchSchema,
  socialPublishSchema,
  syncFestivalsSchema,
  validateBody,
} from "../middleware/validation";
import { asyncHandler } from "../utils/helpers";

const router = Router();

router.use(authenticate);

// School
router.get("/schools", asyncHandler(SchoolController.listSchools));
router.post(
  "/school",
  validateBody(schoolCreateSchema),
  asyncHandler(SchoolController.createSchool),
);
router.get("/school/profile/:id", asyncHandler(SchoolController.getSchoolProfile));
router.put("/school/profile/:id", asyncHandler(SchoolController.updateSchoolProfile));
router.get("/school/branding/:id", asyncHandler(SchoolController.getBranding));

// Events
router.get("/events", asyncHandler(EventController.listEvents));
router.post(
  "/events",
  validateBody(eventCreateSchema),
  asyncHandler(EventController.createEvent),
);
router.get("/events/:schoolId/today", asyncHandler(EventController.getTodayEvents));
router.get("/events/:id", asyncHandler(EventController.getEvent));
router.put("/events/:id", asyncHandler(EventController.updateEvent));
router.delete("/events/:id", asyncHandler(EventController.deleteEvent));

// Designs
router.post(
  "/designs/request",
  validateBody(designRequestSchema),
  asyncHandler(DesignController.requestDesign),
);
router.get("/designs/:id/status", asyncHandler(DesignController.getDesignStatus));
router.get("/designs/:id/result", asyncHandler(DesignController.getDesignResult));

// Jobs — static path before :id so "failed" is not read as an id
router.delete("/jobs/failed", asyncHandler(JobController.deleteFailedJobs));
router.get("/jobs/:id/status", asyncHandler(JobController.getJobStatus));
router.post("/jobs/:id/retry", asyncHandler(JobController.retryJob));
router.delete("/jobs/:id", asyncHandler(JobController.deleteJob));

// Admin endpoints
router.get("/admin/stats", asyncHandler(AdminController.getSystemStats));
router.get("/admin/jobs/recent", asyncHandler(AdminController.getRecentJobs));
router.get("/admin/jobs/failed", asyncHandler(AdminController.getFailedJobs));
router.get("/admin/metrics", asyncHandler(AdminController.getMetrics));

// Analytics
router.get(
  "/analytics/designs/:schoolId",
  asyncHandler(AnalyticsController.getDesignAnalytics),
);
router.get(
  "/analytics/success-rate/:schoolId",
  asyncHandler(AnalyticsController.getSuccessRateByEventType),
);
router.get(
  "/analytics/top-events/:schoolId",
  asyncHandler(AnalyticsController.getTopPerformingEvents),
);

// Social Media
router.get("/social/status", SocialMediaController.getStatus);
router.post(
  "/social/publish",
  validateBody(socialPublishSchema),
  asyncHandler(SocialMediaController.publishDesign),
);
router.post(
  "/social/publish-batch",
  validateBody(socialPublishBatchSchema),
  asyncHandler(SocialMediaController.publishBatch),
);

// Content Calendar — static paths before :schoolId
router.get("/calendar/today", ContentCalendarController.getToday);
router.get("/calendar/festivals", ContentCalendarController.getFestivals);
router.post(
  "/calendar/publish-due",
  asyncHandler(ContentCalendarController.publishDue),
);
router.post(
  "/calendar/entries/:id/publish",
  asyncHandler(ContentCalendarController.publishEntry),
);
router.get(
  "/calendar/:schoolId/nepali",
  asyncHandler(ContentCalendarController.getNepaliCalendar),
);
router.get("/calendar/:schoolId", asyncHandler(ContentCalendarController.getCalendar));
router.post(
  "/calendar/entry",
  validateBody(calendarEntrySchema),
  asyncHandler(ContentCalendarController.createEntry),
);
router.post(
  "/calendar/schedule-publish",
  validateBody(schedulePublishSchema),
  asyncHandler(ContentCalendarController.schedulePublishing),
);
router.post(
  "/calendar/sync-festivals",
  validateBody(syncFestivalsSchema),
  asyncHandler(ContentCalendarController.syncFestivals),
);

export default router;
