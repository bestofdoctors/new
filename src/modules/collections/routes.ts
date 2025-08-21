import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { mintCollection, addItem, getStats } from './service';

const mintSchema = z.object({
  name: z.string().min(1),
});

const addItemSchema = z.object({
  item: z.record(z.unknown()),
});

export default async function collectionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /collections/mint
  fastify.post<{
    Body: { name: string };
    Reply: ApiResponse<{ collectionId: string }>;
  }>(
    '/collections/mint',
    async (request, reply) => {
      try {
        const body = mintSchema.parse(request.body);
        const data = await mintCollection(body.name);
        return {
          success: true,
          data,
          message: 'Collection minted successfully',
        };
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request data',
        });
      }
    }
  );

  // POST /collections/:id/items
  fastify.post<{
    Params: { id: string };
    Body: { item: Record<string, unknown> };
    Reply: ApiResponse<{ itemId: string }>;
  }>(
    '/collections/:id/items',
    async (request, reply) => {
      try {
        const params = request.params;
        const body = addItemSchema.parse(request.body);
        const data = await addItem(params.id, body.item);
        return {
          success: true,
          data,
          message: 'Item added successfully',
        };
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Invalid request data',
        });
      }
    }
  );

  // GET /collections/:id/stats
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<{ itemCount: number }>;
  }>(
    '/collections/:id/stats',
    async (request, reply) => {
      try {
        const data = await getStats(request.params.id);
        return {
          success: true,
          data,
        };
      } catch (error) {
        return reply.code(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get stats',
        });
      }
    }
  );
}
