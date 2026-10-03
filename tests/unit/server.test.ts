import { afterAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../server/app';

describe('serveur local', () => {
  const server = buildServer();

  afterAll(async () => {
    await server.close();
  });

  it('répond sur /api/health', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', app: 'PhysiMotion Studio' });
  });
});
