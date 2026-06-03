import 'dotenv/config';
import pino from 'pino';
import {app} from './app';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});

const port = Number(process.env.PORT ?? 4000);

const server = app.listen(port, () => {
  logger.info(
    {
      port,
      environment: process.env.NODE_ENV ?? 'development',
    },
    `Backend server is running at http://localhost:${port}`,
  );
});

const shutdown = (signal: NodeJS.Signals) => {
  logger.info({signal}, 'Shutting down backend server');
  server.close(() => {
    logger.info('Backend server stopped');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
