import { buildApp } from '../app';
import { FastifyInstance } from 'fastify';

describe('Collections Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and retrieve a collection', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/collections',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Collection' }),
    });

    expect(createRes.statusCode).toBe(200);
    const createBody = JSON.parse(createRes.body);
    const collectionId = createBody.data.collectionId;
    expect(collectionId).toBeDefined();

    const listRes = await app.inject({ method: 'GET', url: '/collections' });
    expect(listRes.statusCode).toBe(200);
    const listBody = JSON.parse(listRes.body);
    expect(Array.isArray(listBody.data)).toBe(true);
    expect(listBody.data.length).toBeGreaterThan(0);

    const getRes = await app.inject({ method: 'GET', url: `/collections/${collectionId}` });
    expect(getRes.statusCode).toBe(200);
    const getBody = JSON.parse(getRes.body);
    expect(getBody.data.id).toBe(collectionId);
  });

  it('should add item and return correct stats', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/collections',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Stats Collection' }),
    });
    const collectionId = JSON.parse(createRes.body).data.collectionId;

    const price = '1000000000000000000';
    const addRes = await app.inject({
      method: 'POST',
      url: `/collections/${collectionId}/items`,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tokenId: 'token1', price }),
    });
    expect(addRes.statusCode).toBe(200);

    const statsRes = await app.inject({
      method: 'GET',
      url: `/collections/${collectionId}/stats`,
    });
    expect(statsRes.statusCode).toBe(200);
    const statsBody = JSON.parse(statsRes.body);
    expect(statsBody.data.total).toBe(1);
    expect(statsBody.data.listed).toBe(1);
    expect(statsBody.data.floorPrice).toBe(price);
    expect(statsBody.data.volume).toBe(price);
    expect(typeof statsBody.data.floorPrice).toBe('string');
  });
});

