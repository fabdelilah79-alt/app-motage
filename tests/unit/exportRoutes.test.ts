import { afterAll, describe, expect, it } from 'vitest';
import demoTemplate from '../../templates/demo.json';
import { buildServer } from '../../server/app';
import { createRenderJobManager } from '../../server/render/jobs';
import { openCommand } from '../../server/openFolder';

const opened: string[] = [];
const jobs = createRenderJobManager({
  render: () => new Promise<string>(() => undefined),
  exportsDir: '/exports',
});

describe('routes d’export', () => {
  const server = buildServer({ jobs, openFolder: (dir) => opened.push(dir) });
  afterAll(async () => {
    await server.close();
  });

  it('accepte des options d’export valides et refuse les autres', async () => {
    const ok = await server.inject({
      method: 'POST',
      url: '/api/render',
      payload: { project: demoTemplate, options: { format: 'gif', range: { kind: 'interval', from: 0, to: 60 } } },
    });
    expect(ok.statusCode).toBe(202);
    expect(ok.json<{ outputPath: string }>().outputPath).toMatch(/\.gif$/);
    const bad = await server.inject({ method: 'POST', url: '/api/render', payload: { project: demoTemplate, options: { format: 'avi' } } });
    expect(bad.statusCode).toBe(400);
  });

  it('ne propose le téléchargement qu’une fois le fichier prêt', async () => {
    const started = await server.inject({ method: 'POST', url: '/api/render', payload: { project: demoTemplate } });
    const { id } = started.json<{ id: string }>();
    const file = await server.inject({ method: 'GET', url: `/api/render/${id}/file` });
    expect(file.statusCode).toBe(404);
  });

  it('ouvre le dossier des exports', async () => {
    const response = await server.inject({ method: 'POST', url: '/api/exports/open', payload: {} });
    expect(response.statusCode).toBe(200);
    expect(opened).toHaveLength(1);
    expect(openCommand('win32')).toBe('explorer');
    expect(openCommand('darwin')).toBe('open');
    expect(openCommand('linux')).toBe('xdg-open');
  });
});
