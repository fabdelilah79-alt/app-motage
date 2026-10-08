import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Fastify from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bubblePosition } from '../../src/editor/tour/bubblePosition';
import { TOUR_STEPS, useTourStore } from '../../src/editor/tour/tourStore';
import { editorFilePath, registerEditorFiles } from '../../server/editorFiles';

const viewport = { width: 1280, height: 800 };
const bubble = { width: 320, height: 190 };

describe('guide du premier lancement', () => {
  it('place la bulle sous la zone, au-dessus, ou à côté, toujours visible', () => {
    expect(bubblePosition({ x: 100, y: 50, width: 200, height: 40 }, bubble, viewport)).toEqual({ x: 40, y: 102 });
    const above = bubblePosition({ x: 600, y: 700, width: 100, height: 60 }, bubble, viewport);
    expect(above.y).toBe(700 - 12 - 190);
    const side = bubblePosition({ x: 0, y: 0, width: 320, height: 800 }, bubble, viewport);
    expect(side).toEqual({ x: 332, y: 12 });
    const center = bubblePosition(null, bubble, viewport);
    expect(center).toEqual({ x: 480, y: 305 });
    for (const position of [above, side, center]) {
      expect(position.x).toBeGreaterThanOrEqual(12);
      expect(position.x + bubble.width).toBeLessThanOrEqual(viewport.width - 12);
    }
  });

  it('enchaîne les étapes puis se ferme', () => {
    const store = useTourStore.getState();
    store.start();
    expect(useTourStore.getState().index).toBe(0);
    useTourStore.getState().previous();
    expect(useTourStore.getState().index).toBe(0);
    for (let step = 1; step < TOUR_STEPS.length; step += 1) useTourStore.getState().next();
    expect(useTourStore.getState().index).toBe(TOUR_STEPS.length - 1);
    useTourStore.getState().next();
    expect(useTourStore.getState().index).toBeNull();
  });
});

describe('éditeur servi par le serveur local (npm start)', () => {
  let dir = '';
  const app = Fastify();
  beforeAll(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'physimotion-dist-'));
    await mkdir(path.join(dir, 'assets'));
    await writeFile(path.join(dir, 'index.html'), '<!doctype html><title>PhysiMotion</title>');
    await writeFile(path.join(dir, 'assets', 'app.js'), 'console.log(1)');
    app.get('/api/health', async () => ({ status: 'ok' }));
    registerEditorFiles(app, dir);
  });
  afterAll(async () => {
    await app.close();
    await rm(dir, { recursive: true, force: true });
  });

  it('sert les fichiers, renvoie l’éditeur pour les autres adresses et laisse passer l’API', async () => {
    const script = await app.inject({ method: 'GET', url: '/assets/app.js' });
    expect(script.headers['content-type']).toContain('text/javascript');
    const page = await app.inject({ method: 'GET', url: '/projets/quelconque' });
    expect(page.body).toContain('<title>PhysiMotion</title>');
    const api = await app.inject({ method: 'GET', url: '/api/health' });
    expect(api.json()).toEqual({ status: 'ok' });
  });

  it('refuse de sortir du dossier de l’éditeur', () => {
    expect(editorFilePath('/app/dist', '/../secret.txt')).toBeNull();
    expect(editorFilePath('/app/dist', '/%2e%2e/%2e%2e/etc/passwd')).toBeNull();
    expect(editorFilePath('/app/dist', '/assets/a.js?v=1')).toBe(path.resolve('/app/dist/assets/a.js'));
  });
});
