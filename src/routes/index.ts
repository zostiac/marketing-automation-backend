import { Router } from 'express';
import { SchoolController } from '../controllers/SchoolController';
import { EventController } from '../controllers/EventController';
import { DesignController } from '../controllers/DesignController';
import { JobController } from '../controllers/JobController';

const router = Router();

// School
router.get('/school/profile/:id', SchoolController.getSchoolProfile);
router.put('/school/profile/:id', SchoolController.updateSchoolProfile);
router.get('/school/branding/:id', SchoolController.getBranding);

// Events
router.post('/events', EventController.createEvent);
router.get('/events/:schoolId/today', EventController.getTodayEvents);
router.get('/events/:id', EventController.getEvent);
router.put('/events/:id', EventController.updateEvent);
router.delete('/events/:id', EventController.deleteEvent);

// Designs
router.post('/designs/request', DesignController.requestDesign);
router.get('/designs/:id/status', DesignController.getDesignStatus);
router.get('/designs/:id/result', DesignController.getDesignResult);

// Jobs
router.get('/jobs/:id/status', JobController.getJobStatus);
router.post('/jobs/:id/retry', JobController.retryJob);

export default router;