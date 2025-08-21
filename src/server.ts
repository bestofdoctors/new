import { buildApp } from './app';
import { config } from './config/env';
import { disconnectDB } from './lib/db';

async function start() {
  try {
    const app = await buildApp();

    // Start server
    await app.listen({
      port: config.PORT,
      host: '0.0.0.0',
    });

    app.log.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully`);
      await app.close();
      await disconnectDB();
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();