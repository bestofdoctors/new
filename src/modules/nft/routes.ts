import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { ApiResponse, MintRequest, ListingRequest } from '@/types/api';
import { prisma } from '../../lib/db';
import { handleRouteError } from '../../lib/errors';

const mintSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  metadata: z.record(z.unknown()).optional(),
});

const listingSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'), 
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d+)?$/, 'Price must be a valid number'),
  currency: z.string().default('ETH').optional(),
  expiresAt: z.string().datetime().optional(),
});

export default async function nftRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /nft/mint - Database-integrated implementation
  fastify.post<{
    Body: MintRequest;
    Reply: ApiResponse<{ mintId: string; status: string }>;
  }>('/nft/mint', async (request, reply) => {
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
      handleRouteError(error, request, reply);
    }
  });

  // POST /nft/list - Database-integrated implementation
  fastify.post<{
    Body: ListingRequest;
    Reply: ApiResponse<{ listingId: string; status: string }>;
  }>('/nft/list', async (request, reply) => {
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
      handleRouteError(error, request, reply);
    }
  });

  // GET /nft/mint/:id - Get mint status
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<{ mintId: string; tokenId: string; status: string; createdAt: string }>;
  }>('/nft/mint/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const mint = await prisma.mint.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!mint) {
        return reply.code(404).send({
          success: false,
          error: 'Mint not found',
        });
      }

      return {
        success: true,
        data: {
          mintId: mint.id,
          tokenId: mint.tokenId,
          status: mint.status.toLowerCase(),
          createdAt: mint.createdAt.toISOString(),
        },
      };
    } catch (error) {
      handleRouteError(error, request, reply);
    }
  });

  // GET /nft/listing/:id - Get listing details
  fastify.get<{
    Params: { id: string };
    Reply: ApiResponse<{ listingId: string; tokenId: string; price: string; currency: string; status: string; expiresAt?: string; createdAt: string }>;
  }>('/nft/listing/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      const listing = await prisma.listing.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!listing) {
        return reply.code(404).send({
          success: false,
          error: 'Listing not found',
        });
      }

      return {
        success: true,
        data: {
          listingId: listing.id,
          tokenId: listing.tokenId,
          price: listing.price,
          currency: listing.currency,
          status: listing.status.toLowerCase(),
          expiresAt: listing.expiresAt?.toISOString(),
          createdAt: listing.createdAt.toISOString(),
        },
      };
    } catch (error) {
      handleRouteError(error, request, reply);
    }
  });
}