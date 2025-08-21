import Fastify, { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { config } from './config/env';

// Import route modules
import healthRoutes from './modules/health/routes';
import nftRoutes from './modules/nft/routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

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

  // Serialize BigInt values to strings in responses
  app.addHook('preSerialization', (request, reply, payload, done) => {
    const convert = (value: unknown): unknown => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (Array.isArray(value)) {
        return value.map(convert);
      }
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, val]) => [key, convert(val)])
        );
      }
      return value;
    };

    done(null, convert(payload));
  });

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