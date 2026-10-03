import { describe, expect, it } from 'vitest';
import { parseProject } from '../../src/shared/schema';
import { createRenderJobManager, type RenderJobState } from '../../server/render/jobs';
import type { RenderCallbacks } from '../../server/render/renderProject';
import { makeProjectInput } from './fixtures';

const flush = () => new Promise((resolve) => setImmediate(resolve));

/** Faux moteur de rendu piloté par le test. */
const createFakeRender = () => {
  const controls: {
    callbacks?: RenderCallbacks;
    resolve?: (path: string) => void;
    reject?: (error: unknown) => void;
  } = {};
  const render = (_project: unknown, outputLocation: string, callbacks: RenderCallbacks) => {
    controls.callbacks = callbacks;
    return new Promise<string>((resolve, reject) => {
      controls.resolve = () => resolve(outputLocation);
      controls.reject = reject;
    });
  };
  return { render, controls };
};

const project = parseProject(makeProjectInput({ title: 'La chute libre' }));
const now = () => new Date(2026, 9, 3, 14, 5, 9);

describe('suivi des rendus', () => {
  it('passe par les étapes préparation → rendu → terminé', async () => {
    const { render, controls } = createFakeRender();
    const manager = createRenderJobManager({ render, exportsDir: '/exports', now });
    const job = manager.start(project);
    const seen: RenderJobState[] = [];
    manager.subscribe(job.id, (state) => seen.push(state));

    expect(job.status).toBe('bundling');
    expect(job.outputPath).toMatch(/la-chute-libre_2026-10-03_14-05-09\.mp4$/);

    controls.callbacks?.onStage?.('rendering');
    controls.callbacks?.onProgress?.(0.456);
    controls.callbacks?.onProgress?.(0.459);
    expect(manager.get(job.id)).toMatchObject({ status: 'rendering', progress: 0.45 });

    controls.resolve?.(job.outputPath);
    await flush();
    expect(manager.get(job.id)).toMatchObject({ status: 'done', progress: 1 });
    // 0,459 arrondi à 0,45 : pas de notification en double.
    expect(seen.map((state) => state.status)).toEqual(['rendering', 'rendering', 'done']);
  });

  it('signale une erreur de rendu', async () => {
    const { render, controls } = createFakeRender();
    const manager = createRenderJobManager({ render, exportsDir: '/exports', now });
    const job = manager.start(project);

    controls.reject?.(new Error('Chrome introuvable'));
    await flush();
    expect(manager.get(job.id)).toMatchObject({ status: 'error', error: 'Chrome introuvable' });
  });

  it('annule un rendu, même demandé avant le début du rendu des images', async () => {
    const { render, controls } = createFakeRender();
    const manager = createRenderJobManager({ render, exportsDir: '/exports', now });
    const job = manager.start(project);

    expect(manager.cancel(job.id)).toBe(true);
    let stopped = false;
    controls.callbacks?.cancelSignal?.(() => {
      stopped = true;
      controls.reject?.(new Error('renderMedia() got cancelled'));
    });
    expect(stopped).toBe(true);

    await flush();
    expect(manager.get(job.id)?.status).toBe('cancelled');
    expect(manager.cancel(job.id)).toBe(false);
  });

  it('ignore un identifiant inconnu', () => {
    const { render } = createFakeRender();
    const manager = createRenderJobManager({ render, exportsDir: '/exports', now });
    expect(manager.get('inconnu')).toBeUndefined();
    expect(manager.cancel('inconnu')).toBe(false);
    expect(manager.subscribe('inconnu', () => undefined)).toBeUndefined();
  });
});
