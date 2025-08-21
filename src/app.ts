import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { config } from './config/env';
import { connectDB } from './lib/db';

// Import route modules
import healthRoutes from './modules/health/routes';
import nftRoutes from './modules/nft/routes';
import collectionRoutes from './modules/collections/routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Connect to database
  await connectDB();

  // Register plugins
  await app.register(helmet, {
    contentSecurityPolicy: config.NODE_ENV === 'production',
  });

  await app.register(cors, {
    origin: config.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Configure for production
      : true, // Allow all origins in development
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(nftRoutes);
  await app.register(collectionRoutes);

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    
    if (error.validation) {
      return reply.code(400).send({
        success: false,
        error: 'Validation error',
        details: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    return reply.code(statusCode).send({
      success: false,
      error: config.NODE_ENV === 'production' 
        ? 'Internal server error'
        : error.message,
    });
  });

  return app;
}