import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { config } from './config/env';
import routes from './routes';
import { HealthController } from './controllers/HealthController';
import { startScheduledTasks } from './queues/scheduledTasks';
import { startWorkers } from './queues/workers';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { warnIfAuthDisabled } from './middleware/authentication';
import { asyncHandler } from './utils/helpers';
import { logger } from './utils/logger';

const app = express();

app.use(cors());
app.use(requestLogger);
app.use(express.json());

// Health check endpoint for Railway / load balancers — always public
app.get('/health', HealthController.getHealth);
app.get('/health/ready', asyncHandler(HealthController.getReady));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
  try {
    logger.info('Starting application bootstrap...');

    await initializeDatabase();
    logger.info('Database connected');

    await initializeRedis();
    logger.info('Redis connected');

    startWorkers();
    startScheduledTasks();
    warnIfAuthDisabled();

    app.listen(config.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.port} (0.0.0.0:${config.port})`);
    });
  } catch (error) {
    logger.error('Bootstrap error', {
      error: error instanceof Error ? error.stack || error.message : String(error),
    });
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
