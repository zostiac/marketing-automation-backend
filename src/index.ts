import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { config } from './config/env';
import routes from './routes';
import { startScheduledTasks } from './queues/scheduledTasks';

const app = express();

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint for Railway / load balancers
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled request error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  try {
    console.log('Starting application bootstrap...');

    await initializeDatabase();
    console.log('✓ Database connected');

    await initializeRedis();
    console.log('✓ Redis connected');

    startScheduledTasks();
    console.log('✓ Scheduled tasks started');

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
