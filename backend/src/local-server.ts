import './config/localEnv';
import pino from 'pino';
import {app} from './app';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});

const requestedPort = Number(process.env.PORT ?? 4000);

const server = app.listen(requestedPort, () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : requestedPort;
  logger.info(
    {
      port,
      environment: process.env.NODE_ENV ?? 'development',
    },
    `Backend server is running at http://localhost:${port}`,
  );
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(
      {port: requestedPort},
      `Port ${requestedPort} is already in use. Stop the old backend process or set another PORT in backend/.env.`,
    );
    process.exit(1);
  }

  throw error;
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
