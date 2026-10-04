import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ProjectNotFoundError,
  UnsupportedFileError,
  createProjectStore,
} from '../../server/projects/projectStore';

let dir = '';
let counter = 0;
const newId = () => `id${String(++counter).padStart(4, '0')}`;
const input = (title: string) => ({
  title,
  formatId: 'landscape' as const,
  defaultLang: 'fr' as const,
});
const svg = Buffer.from('<svg/>');

describe('projets enregistrés sur le disque', () => {
  beforeEach(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'physimotion-'));
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('crée, relit, liste et enregistre un projet', async () => {
    const store = createProjectStore(dir, newId);
    const project = await store.create(input('Chute libre'));
    expect(project.id).toMatch(/^chute-libre-id\d{4}$/);
    expect(await store.read(project.id)).toEqual(project);

    await store.save(project.id, { ...project, title: 'Chute libre (v2)' });
    const list = await store.list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: project.id, title: 'Chute libre (v2)' });
  });

  it('duplique un projet avec ses fichiers', async () => {
    const store = createProjectStore(dir, newId);
    const original = await store.create(input('Ondes'));
    const asset = await store.addAsset(original.id, 'schéma.svg', 'image/svg+xml', svg);
    const copy = await store.duplicate(original.id, 'Ondes (copie)');
    expect(copy.id).not.toBe(original.id);
    const copiedFile = store.resolveFile(copy.id, asset.src);
    expect(copiedFile && (await readFile(copiedFile, 'utf8'))).toBe('<svg/>');
  });

  it('reconnaît le type des médias importés (vidéo, son, GIF, Lottie)', async () => {
    const store = createProjectStore(dir, newId);
    const project = await store.create(input('Médias'));
    const kinds = await Promise.all(
      [
        ['clip.mp4', 'video/mp4'],
        ['voix.wav', 'audio/wav'],
        ['anim.gif', 'image/gif'],
        ['anim.json', 'application/x-lottie+json'],
      ].map(async ([name = '', type = '']) => {
        const asset = await store.addAsset(project.id, name, type, svg);
        return asset.kind;
      }),
    );
    expect(kinds).toEqual(['video', 'audio', 'gif', 'lottie']);
    const withMeta = await store.addAsset(project.id, 'v.wav', 'audio/wav', svg, {
      durationInSeconds: 3.5,
    });
    expect(withMeta.meta).toEqual({ durationInSeconds: 3.5 });
  });

  it('range les images importées dans assets/ avec un nom sûr', async () => {
    const store = createProjectStore(dir, newId);
    const project = await store.create(input('Optique'));
    const name = 'Lentille Convergente.PNG';
    const asset = await store.addAsset(project.id, name, 'image/png', svg);
    expect(asset).toMatchObject({ kind: 'image', storage: 'project', name });
    expect(asset.src).toMatch(/^assets\/id\d{4}-lentille-convergente\.png$/);
    const executable = store.addAsset(project.id, 'x.exe', 'application/x-msdownload', svg);
    await expect(executable).rejects.toBeInstanceOf(UnsupportedFileError);
  });

  it('refuse les identifiants et chemins dangereux', async () => {
    const store = createProjectStore(dir, newId);
    await expect(store.read('../secret')).rejects.toBeInstanceOf(ProjectNotFoundError);
    await expect(store.read('inexistant')).rejects.toBeInstanceOf(ProjectNotFoundError);
    const project = await store.create(input('Test'));
    expect(store.resolveFile(project.id, '../../etc/passwd')).toBeNull();
    const expected = path.join(dir, project.id, 'project.json');
    expect(store.resolveFile(project.id, 'project.json')).toBe(expected);
  });
});
