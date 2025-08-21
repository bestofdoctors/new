import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';

// Mock RPC module to keep tests offline
jest.mock('../modules/collections/rpc', () => ({
  mintCollection: jest.fn().mockResolvedValue({ collectionId: 'mock-collection' }),
  addItem: jest.fn().mockResolvedValue({ itemId: 'mock-item' }),
  getStats: jest.fn().mockResolvedValue({ itemCount: 42 }),
}));

import * as rpc from '../modules/collections/rpc';

describe('Collection Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('mints a collection', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/collections/mint',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Collection' }),
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.collectionId).toBe('mock-collection');
    expect(rpc.mintCollection).toHaveBeenCalledWith({ name: 'Test Collection' });
  });

  it('adds an item to a collection', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/collections/mock-collection/items',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ item: { name: 'Item 1' } }),
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.itemId).toBe('mock-item');
    expect(rpc.addItem).toHaveBeenCalledWith({ collectionId: 'mock-collection', item: { name: 'Item 1' } });
  });

  it('retrieves collection stats', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/collections/mock-collection/stats',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
    expect(body.data.itemCount).toBe(42);
    expect(rpc.getStats).toHaveBeenCalledWith({ collectionId: 'mock-collection' });
  });
});
