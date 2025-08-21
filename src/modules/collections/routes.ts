import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { mintCollection, addItem, getStats } from './service';
import { handleRouteError } from '../../lib/errors';
import { prisma } from '../../lib/db';

const mintSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(255, 'Collection name is too long'),
});

const addItemSchema = z.object({
  item: z.record(z.unknown()).refine((item) => Object.keys(item).length > 0, 'Item data cannot be empty'),
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
        handleRouteError(error, request, reply);
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
        const data = await addItem(params.id, body.item as Record<string, unknown>);
        return {
          success: true,
          data,
          message: 'Item added successfully',
        };
      } catch (error) {
        handleRouteError(error, request, reply);
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
        handleRouteError(error, request, reply);
      }
    }
  );

  // GET /collections/:id - Get collection details
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<{ collectionId: string; name: string; itemCount: number; createdAt: string }>;
  }>(
    '/collections/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        
        const collection = await prisma.collection.findUnique({
          where: { id },
          include: { 
            user: true,
            _count: {
              select: { items: true }
            }
          },
        });

        if (!collection) {
          return reply.code(404).send({
            success: false,
            error: 'Collection not found',
          });
        }

        return {
          success: true,
          data: {
            collectionId: collection.id,
            name: collection.name,
            itemCount: collection._count.items,
            createdAt: collection.createdAt.toISOString(),
          },
        };
      } catch (error) {
        handleRouteError(error, request, reply);
      }
    }
  );

  // GET /collections/:id/items - Get collection items
  fastify.get<{
    Params: { id: string };
    Querystring: { page?: string; limit?: string };
    Reply: ApiResponse<{ items: Array<{ itemId: string; item: any; createdAt: string }>; pagination: { page: number; limit: number; total: number } }>;
  }>(
    '/collections/:id/items',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '10', 10), 100);
        const skip = (page - 1) * limit;
        
        // Check if collection exists
        const collection = await prisma.collection.findUnique({
          where: { id },
        });

        if (!collection) {
          return reply.code(404).send({
            success: false,
            error: 'Collection not found',
          });
        }

        // Get items with pagination
        const [items, total] = await Promise.all([
          prisma.collectionItem.findMany({
            where: { collectionId: id },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.collectionItem.count({
            where: { collectionId: id },
          }),
        ]);

        return {
          success: true,
          data: {
            items: items.map((item: any) => ({
              itemId: item.id,
              item: item.item,
              createdAt: item.createdAt.toISOString(),
            })),
            pagination: {
              page,
              limit,
              total,
            },
          },
        };
      } catch (error) {
        handleRouteError(error, request, reply);
      }
    }
  );
}
