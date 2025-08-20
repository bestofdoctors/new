import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ApiResponse } from '@/types/api';

export default async function healthRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.get('/health', async (request, reply) => {
    return { ok: true };
  });
}