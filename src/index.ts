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

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function bootstrap() {
  try {
    await initializeDatabase();
    console.log('✓ Database connected');

    await initializeRedis();
    console.log('✓ Redis connected');

    startScheduledTasks();
    console.log('✓ Scheduled tasks started');

    app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  process.exit(0);
});