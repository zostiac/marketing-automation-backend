import winston from 'winston';
import { config } from '../config/env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} ${level}: ${stack || message}${rest}`;
  }),
);

export const logger = winston.createLogger({
  level: config.log_level || 'info',
  format:
    config.node_env === 'production'
      ? combine(timestamp(), errors({ stack: true }), json())
      : devFormat,
  defaultMeta: { service: 'marketing-automation-backend' },
  transports: [new winston.transports.Console()],
});
