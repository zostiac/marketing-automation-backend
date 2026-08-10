import { createClient } from 'redis';
import { config } from './env';

const redisUrl = config.redis_url || 'redis://127.0.0.1:6379';

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection attempts exceeded');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries * 500, 3000);
    },
  },
});

redis.on('error', (err) => console.error('Redis Client Error:', err));

export async function initializeRedis() {
  try {
    if (!redis.isOpen) {
      await redis.connect();
      console.log('Redis connected successfully');
    }
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
}

export { redis };
