import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { config } from './config/env';
import routes from './routes';
import { startScheduledTasks } from './queues/scheduledTasks';
import { HealthController } from './controllers/HealthController';

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health endpoints — support all probes the frontend and Railway may use.
// Railway's healthcheckPath is /health (see railway.json).
// The Next.js frontend probes /healthz (see frontend/src/lib/api.ts).
// We also expose /api/health for completeness.
app.get('/health', HealthController.health);
app.get('/healthz', HealthController.healthz);
app.get('/api/health', HealthController.health);

app.use('/api', routes);

// Fallback for unknown routes under /api — return JSON not HTML
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled request error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  try {
    console.log('Starting application bootstrap...');

    // Database — best-effort so the health endpoint and provider-backed
    // dashboard routes (occasions/branding without DB) remain available even
    // when postgres is transiently down. In production we still warn loudly.
    try {
      await initializeDatabase();
      console.log('✓ Database connected');
      // Run migrations best-effort (creates tables on fresh Railway deploy)
      try {
        const { runMigrations } = await import('./database/migrations');
        await runMigrations();
      } catch (e) {
        console.warn('[WARN] Migrations failed (non-fatal):', e);
      }
    } catch (e) {
      console.error('✗ Database connection failed:', e);
      if (config.node_env === 'production') {
        console.warn('[WARN] Continuing without database — health endpoint remains live, DB-backed routes will degrade');
      } else {
        console.warn('[WARN] Running without database — some routes will return fallback data');
      }
    }

    try {
      await Promise.race([
        initializeRedis(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Redis connect timeout after 3000ms')), 3000),
        ),
      ]);
      console.log('✓ Redis connected');
    } catch (e) {
      console.error('✗ Redis connection failed:', e);
      console.warn('[WARN] Continuing without Redis — queue will be unavailable');
    }

    try {
      startScheduledTasks();
      console.log('✓ Scheduled tasks started');
    } catch (e) {
      console.warn('[WARN] Scheduled tasks failed to start:', e);
    }

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${config.port} (0.0.0.0:${config.port})`);
    });
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
