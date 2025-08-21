import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { umi } from '@/lib/umi';
import {
  createCollectionV1,
  findMetadataPda,
  verifyCollectionV1,
} from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount, publicKey } from '@metaplex-foundation/umi';

const collections = new Map<string, string>();

export default async function collectionRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  fastify.post<{
    Params: { id: string };
    Reply: ApiResponse<{ collectionAddress: string }>;
  }>('/collections/:id/mint-collection', async (request, reply) => {
    const { id } = request.params;

    const collectionMint = generateSigner(umi);
    try {
      await createCollectionV1(umi, {
        mint: collectionMint,
        authority: umi.identity,
        name: `Collection ${id}`,
        uri: '',
        sellerFeeBasisPoints: percentAmount(0),
      }).sendAndConfirm(umi);
    } catch (err) {
      fastify.log.error(err);
    }

    const address = collectionMint.publicKey.toString();
    collections.set(id, address);

    return {
      success: true,
      data: { collectionAddress: address },
      message: 'Collection minted',
    };
  });

  const verifySchema = z.object({
    mint: z.string(),
  });

  fastify.post<{
    Params: { id: string };
    Body: { mint: string };
    Reply: ApiResponse<{ verified: boolean }>;
  }>(
    '/collections/:id/verify-item',
    {
      schema: {
        body: {
          type: 'object',
          required: ['mint'],
          properties: { mint: { type: 'string' } },
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = verifySchema.parse(request.body);

      const collectionMint = collections.get(id);
      if (!collectionMint) {
        return reply
          .code(404)
          .send({ success: false, error: 'Collection not found' });
      }

      try {
        const metadata = findMetadataPda(umi, {
          mint: publicKey(body.mint),
        });

        await verifyCollectionV1(umi, {
          metadata,
          collectionMint: publicKey(collectionMint),
          authority: umi.identity,
        }).sendAndConfirm(umi);
      } catch (err) {
        fastify.log.error(err);
      }

      return {
        success: true,
        data: { verified: true },
        message: 'Item verified',
      };
    }
  );
}
