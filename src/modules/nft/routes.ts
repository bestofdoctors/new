import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { ApiResponse, MintRequest, ListingRequest } from '@/types/api';
import { prisma } from '../../lib/db';

const mintSchema = z.object({
  tokenId: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

const listingSchema = z.object({
  tokenId: z.string().min(1),
  price: z.string().min(1),
  currency: z.string().default('ETH'),
  expiresAt: z.string().datetime().optional(),
});

export default async function nftRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /nft/mint - Stub implementation
  fastify.post<{
    Body: MintRequest;
    Reply: ApiResponse<{ mintId: string; status: string }>;
  }>('/nft/mint', {
    schema: {
      body: {
        type: 'object',
        required: ['tokenId'],
        properties: {
          tokenId: { type: 'string', minLength: 1 },
          metadata: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = mintSchema.parse(request.body);
      
      // Create mint record in database
      const mint = await prisma.mint.create({
        data: {
          tokenId: body.tokenId,
          metadata: body.metadata || {},
          status: 'PENDING',
          // For now, create a dummy user - in real app this would come from auth
          user: {
            connectOrCreate: {
              where: { email: 'anonymous@example.com' },
              create: {
                email: 'anonymous@example.com',
                username: `user_${Date.now()}`,
              },
            },
          },
        },
        include: {
          user: true,
        },
      });

      return {
        success: true,
        data: {
          mintId: mint.id,
          status: mint.status.toLowerCase(),
        },
        message: 'NFT mint initiated successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  });

  // POST /nft/list - Stub implementation
  fastify.post<{
    Body: ListingRequest;
    Reply: ApiResponse<{ listingId: string; status: string }>;
  }>('/nft/list', {
    schema: {
      body: {
        type: 'object',
        required: ['tokenId', 'price'],
        properties: {
          tokenId: { type: 'string', minLength: 1 },
          price: { type: 'string', minLength: 1 },
          currency: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const body = listingSchema.parse(request.body);
      
      // Create listing record in database
      const listing = await prisma.listing.create({
        data: {
          tokenId: body.tokenId,
          price: body.price,
          currency: body.currency || 'ETH',
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          status: 'ACTIVE',
          // For now, create a dummy user - in real app this would come from auth
          user: {
            connectOrCreate: {
              where: { email: 'anonymous@example.com' },
              create: {
                email: 'anonymous@example.com',
                username: `user_${Date.now()}`,
              },
            },
          },
        },
        include: {
          user: true,
        },
      });
      
      return {
        success: true,
        data: {
          listingId: listing.id,
          status: listing.status.toLowerCase(),
        },
        message: 'NFT listed successfully',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request data',
      });
    }
  });
}