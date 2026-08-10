import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { initializeDatabase } from './database/connection';
import { initializeRedis } from './config/redis';
import { startScheduledTasks } from './queues/scheduledTasks';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(requestLogger);

app.use('/api', routes);

app.use(errorHandler);

async function bootstrap() {
  try {
    await initializeDatabase();
    logger.info('Database initialized');

    await initializeRedis();
    logger.info('Redis connected');

    startScheduledTasks();
    logger.info('Scheduled tasks started');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Bootstrap failed:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});