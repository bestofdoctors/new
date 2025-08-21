import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';

import {
  ApiResponse,
  CreateCollectionRequest,
  AddItemRequest,
  Collection,
  CollectionStats,
} from '@/types/api';

interface InternalCollectionItem {
  tokenId: string;
  price: bigint; // stored as BigInt internally
}

interface InternalCollection {
  id: string;
  name: string;
  description?: string;
  items: InternalCollectionItem[];
}

const collections: Record<string, InternalCollection> = {};

const createCollectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const addItemSchema = z.object({
  tokenId: z.string().min(1),
  price: z.string().optional(),
});

export default async function collectionsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Create collection
  fastify.post<{
    Body: CreateCollectionRequest;
    Reply: ApiResponse<{ collectionId: string }>;
  }>('/collections', async (request, reply) => {
    try {
      const body = createCollectionSchema.parse(request.body);

      const id = `col_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      collections[id] = {
        id,
        name: body.name,
        description: body.description,
        items: [],
      };

      return {
        success: true,
        data: { collectionId: id },
        message: 'Collection created successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  });

  // List collections
  fastify.get<{ Reply: ApiResponse<Collection[]> }>(
    '/collections',
    async () => {
      const data: Collection[] = Object.values(collections).map((col) => ({
        id: col.id,
        name: col.name,
        description: col.description,
        items: col.items.map((item) => ({
          tokenId: item.tokenId,
          price: item.price.toString(),
        })),
      }));
      return { success: true, data };
    }
  );

  // Get collection by id
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<Collection | null>;
  }>('/collections/:id', async (request, reply) => {
    const { id } = request.params;
    const col = collections[id];
    if (!col) {
      return reply.code(404).send({
        success: false,
        error: 'Collection not found',
      });
    }

    const data: Collection = {
      id: col.id,
      name: col.name,
      description: col.description,
      items: col.items.map((item) => ({
        tokenId: item.tokenId,
        price: item.price.toString(),
      })),
    };

    return { success: true, data };
  });

  // Add item to collection
  fastify.post<{
    Params: { id: string };
    Body: AddItemRequest;
    Reply: ApiResponse<{ tokenId: string }>;
  }>('/collections/:id/items', async (request, reply) => {
    try {
      const { id } = request.params;
      const col = collections[id];
      if (!col) {
        return reply.code(404).send({
          success: false,
          error: 'Collection not found',
        });
      }

      const body = addItemSchema.parse(request.body);
      const price = body.price ? BigInt(body.price) : BigInt(0);

      col.items.push({ tokenId: body.tokenId, price });

      return {
        success: true,
        data: { tokenId: body.tokenId },
        message: 'Item added to collection',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  });

  // Remove item from collection
  fastify.delete<{
    Params: { id: string; tokenId: string };
    Reply: ApiResponse<{ tokenId: string }>;
  }>('/collections/:id/items/:tokenId', async (request, reply) => {
    const { id, tokenId } = request.params;
    const col = collections[id];
    if (!col) {
      return reply.code(404).send({
        success: false,
        error: 'Collection not found',
      });
    }

    const index = col.items.findIndex((i) => i.tokenId === tokenId);
    if (index === -1) {
      return reply.code(404).send({
        success: false,
        error: 'Item not found in collection',
      });
    }

    col.items.splice(index, 1);

    return {
      success: true,
      data: { tokenId },
      message: 'Item removed from collection',
    };
  });

  // Collection stats
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<CollectionStats>;
  }>('/collections/:id/stats', async (request, reply) => {
    const { id } = request.params;
    const col = collections[id];
    if (!col) {
      return reply.code(404).send({
        success: false,
        error: 'Collection not found',
      });
    }

    const total = col.items.length;
    const listedItems = col.items.filter((item) => item.price > 0n);
    const listed = listedItems.length;

    const floorPrice = listedItems.length
      ? listedItems.reduce((min, item) => (item.price < min ? item.price : min), listedItems[0].price)
      : BigInt(0);

    const volume = col.items.reduce((sum, item) => sum + item.price, BigInt(0));

    const data: CollectionStats = {
      total,
      listed,
      floorPrice: floorPrice.toString(),
      volume: volume.toString(),
    };

    return { success: true, data };
  });
}

