import { db } from '../config/database';
import { SchoolService } from './SchoolService';
import { EventService } from './EventService';
import { CreativeDirector } from './CreativeDirector';
import { DesignPromptBuilder } from './DesignPromptBuilder';
import { DesignGeneratorAdapter } from './DesignGeneratorAdapter';
import { QualityController } from './QualityController';
import { AssetManager } from './AssetManager';
import { config } from '../config/env';

export class JobProcessor {
  static async processDesignJob(jobId: string, designRequestId: string): Promise<void> {
    const startTime = Date.now();

    try {
      await db.query(
        'UPDATE design_jobs SET status = $1, started_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['PROCESSING', jobId]
      );

      const requestResult = await db.query('SELECT * FROM design_requests WHERE id = $1', [designRequestId]);
      const designRequest = requestResult.rows[0];

      const school = await SchoolService.getSchoolProfile(designRequest.school_id);
      const event = await EventService.getEvent(designRequest.event_id);

      // Generate creative direction
      const creativeDirection = await CreativeDirector.generateCreativeDirection({
        school,
        event,
        design_type: designRequest.design_type,
        audience: 'students, parents, educators',
        platform: 'social_media_and_print',
      });

      // Store creative direction
      const directionResult = await db.query(
        `INSERT INTO creative_directions (design_request_id, concept, composition, layout, visual_hierarchy, typography, color_usage, imagery, illustration_style, background, logo_integration, mood)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [designRequestId, creativeDirection.concept, creativeDirection.composition, creativeDirection.layout, creativeDirection.visual_hierarchy, creativeDirection.typography, creativeDirection.color_usage, creativeDirection.imagery, creativeDirection.illustration_style, creativeDirection.background, creativeDirection.logo_integration, creativeDirection.mood]
      );

      // Build design prompt
      const designPrompt = DesignPromptBuilder.buildDesignPrompt(creativeDirection, school, event, { width: 1200, height: 630 });

      // Generate image
      const imageBuffer = await DesignGeneratorAdapter.generateImage(designPrompt, { width: 1200, height: 630 });

      // Store asset
      const storageKey = await AssetManager.storeGeneratedAsset(imageBuffer, config.bucket_name, designRequest.event_id, designRequest.design_type);

      // Store asset in DB
      const assetResult = await db.query(
        `INSERT INTO assets (design_job_id, event_id, design_type, storage_location, storage_bucket, file_size_bytes, mime_type, metadata, quality_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [jobId, designRequest.event_id, designRequest.design_type, storageKey, config.bucket_name, imageBuffer.length, 'image/png', JSON.stringify({ creative_direction: creativeDirection }), 'PENDING_REVIEW']
      );

      // Quality check
      if (config.quality_check_enabled) {
        const qualityResult = QualityController.performQualityCheck({ file_size_bytes: imageBuffer.length, mime_type: 'image/png' });
        await db.query(
          'UPDATE assets SET quality_status = $1, quality_notes = $2 WHERE id = $3',
          [qualityResult.status === 'APPROVED' ? 'APPROVED' : 'NEEDS_REVISION', qualityResult.issues.join('; '), assetResult.rows[0].id]
        );
      }

      // Update job
      const duration = Date.now() - startTime;
      await db.query(
        `UPDATE design_jobs SET status = $1, completed_at = CURRENT_TIMESTAMP, generation_time_ms = $2, prompt = $3 WHERE id = $4`,
        ['APPROVED', duration, designPrompt, jobId]
      );

      console.log(`Job ${jobId} completed in ${duration}ms`);
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      await db.query(
        `UPDATE design_jobs SET status = $1, error_message = $2, retry_count = retry_count + 1, completed_at = CURRENT_TIMESTAMP WHERE id = $3`,
        ['FAILED', String(error), jobId]
      );
      throw error;
    }
  }
}