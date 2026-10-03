import { afterAll, describe, expect, it } from 'vitest';
import demoTemplate from '../../templates/demo.json';
import { buildServer } from '../../server/app';
import { createRenderJobManager } from '../../server/render/jobs';

// Faux rendu qui ne se termine jamais : on teste seulement les routes.
const jobs = createRenderJobManager({
  render: () => new Promise<string>(() => undefined),
  exportsDir: '/exports',
});

describe('serveur local', () => {
  const server = buildServer({ jobs });

  afterAll(async () => {
    await server.close();
  });

  it('répond sur /api/health', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', app: 'PhysiMotion Studio' });
  });

  it('lance un rendu pour un projet valide puis donne son état', async () => {
    const started = await server.inject({
      method: 'POST',
      url: '/api/render',
      payload: { project: demoTemplate },
    });
    expect(started.statusCode).toBe(202);
    const { id } = started.json<{ id: string }>();

    const state = await server.inject({ method: 'GET', url: `/api/render/${id}` });
    expect(state.json()).toMatchObject({ id, status: 'bundling', progress: 0 });

    const cancelled = await server.inject({ method: 'DELETE', url: `/api/render/${id}` });
    expect(cancelled.json()).toEqual({ cancelled: true });
  });

  it('refuse un projet invalide', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/render',
      payload: { project: { schemaVersion: 1, scenes: [] } },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: 'invalid-project' });
  });

  it('répond 404 pour un rendu inconnu', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/render/inconnu' });
    expect(response.statusCode).toBe(404);
  });
});
