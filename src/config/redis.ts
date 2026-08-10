import { createClient } from 'redis';
import { config } from './env';

const redis = createClient({
  url: config.redis_url,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function initializeRedis() {
  await redis.connect();
  console.log('Redis connected');
}

export { redis };