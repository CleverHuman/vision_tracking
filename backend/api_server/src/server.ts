import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { initializeSocketIO } from './socket/live-analysis.gateway';
import prisma from './lib/prisma';

async function bootstrap(): Promise<void> {
  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  initializeSocketIO(server);

  // Start server
  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      docs: `http://localhost:${env.PORT}/api/docs`,
    });
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(() => {
      logger.info('HTTP server closed');
    });

    await prisma.$disconnect();
    logger.info('Database connection closed');

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});
