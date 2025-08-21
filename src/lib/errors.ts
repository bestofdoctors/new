import { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export function handleRouteError(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  if (error instanceof ZodError) {
    reply.code(400).send({
      success: false,
      error: 'Validation error',
      details: error.errors,
    } as ErrorResponse);
    return;
  }

  if (error instanceof Error) {
    // Handle specific known errors
    if (error.message.includes('Unique constraint')) {
      reply.code(409).send({
        success: false,
        error: 'Resource already exists',
      } as ErrorResponse);
      return;
    }

    if (error.message.includes('Foreign key constraint')) {
      reply.code(400).send({
        success: false,
        error: 'Invalid reference to related resource',
      } as ErrorResponse);
      return;
    }

    // Generic error response
    reply.code(400).send({
      success: false,
      error: error.message,
    } as ErrorResponse);
    return;
  }

  // Unknown error
  reply.code(500).send({
    success: false,
    error: 'Internal server error',
  } as ErrorResponse);
}