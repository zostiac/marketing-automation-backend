import Queue from 'bull';
import { redis } from '../config/redis';
import { JobProcessor } from '../services/JobProcessor';
import { config } from '../config/env';

export const designQueue = new Queue('design', {
  redis: {
    port: new URL(config.redis_url).port ? parseInt(new URL(config.redis_url).port) : 6379,
    host: new URL(config.redis_url).hostname,
  },
});

designQueue.process(1, async (job) => {
  const { jobId, designRequestId } = job.data;
  await JobProcessor.processDesignJob(jobId, designRequestId);
});

designQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

designQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});