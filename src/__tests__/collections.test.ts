import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';
import { generateSigner } from '@metaplex-foundation/umi';
import { umi } from '../lib/umi';

describe('Collection Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('mints collection and verifies an item', async () => {
    const id = 'test-collection';

    const mintRes = await app.inject({
      method: 'POST',
      url: `/collections/${id}/mint-collection`,
    });

    expect(mintRes.statusCode).toBe(200);
    const mintBody = JSON.parse(mintRes.body);
    expect(mintBody.success).toBe(true);
    expect(mintBody.data.collectionAddress).toBeDefined();

    const itemMint = generateSigner(umi).publicKey.toString();

    const verifyRes = await app.inject({
      method: 'POST',
      url: `/collections/${id}/verify-item`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mint: itemMint }),
    });

    expect(verifyRes.statusCode).toBe(200);
    const verifyBody = JSON.parse(verifyRes.body);
    expect(verifyBody.success).toBe(true);
    expect(verifyBody.data.verified).toBe(true);
  });
});
