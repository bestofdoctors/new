import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';

describe('NFT Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /nft/mint', () => {
    it('should accept valid mint request', async () => {
      const mintData = {
        tokenId: 'test-token-123',
        metadata: {
          name: 'Test NFT',
          description: 'A test NFT',
        },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/nft/mint',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(mintData),
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.mintId).toBeDefined();
      expect(body.data.status).toBe('pending');
    });

    it('should reject invalid mint request', async () => {
      const invalidData = {
        // Missing tokenId
        metadata: {},
      };

      const response = await app.inject({
        method: 'POST',
        url: '/nft/mint',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });
  });

  describe('POST /nft/list', () => {
    it('should accept valid listing request', async () => {
      const listingData = {
        tokenId: 'test-token-123',
        price: '1.5',
        currency: 'ETH',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/nft/list',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.listingId).toBeDefined();
      expect(body.data.status).toBe('active');
    });

    it('should reject invalid listing request', async () => {
      const invalidData = {
        tokenId: 'test-token-123',
        // Missing price
      };

      const response = await app.inject({
        method: 'POST',
        url: '/nft/list',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.statusCode).toBe(400);
      
      const body = JSON.parse(response.body);
      expect(body.error).toBeDefined();
    });
  });
});