import { JobProcessor } from '../services/JobProcessor';
import { logger } from '../utils/logger';
import { designQueue } from './designQueue';

export function startWorkers(): void {
  designQueue.process(1, async (job) => {
    const { jobId, designRequestId } = job.data;
    await JobProcessor.processDesignJob(jobId, designRequestId);
  });

  logger.info('Design queue worker started');
}
