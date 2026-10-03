import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildServer } from '../../server/app';
import { parseProject, type Project } from '../../src/shared/schema';

let dir = '';
let server: ReturnType<typeof buildServer>;

describe('routes des projets et des fichiers', () => {
  beforeAll(async () => {
    dir = await mkdtemp(path.join(os.tmpdir(), 'physimotion-routes-'));
    server = buildServer({ projectsDir: dir });
  });
  afterAll(async () => {
    await server.close();
    await rm(dir, { recursive: true, force: true });
  });

  const createProject = async (): Promise<Project> => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { title: 'La lumière', formatId: 'landscape', defaultLang: 'fr' },
    });
    expect(response.statusCode).toBe(201);
    return parseProject(response.json());
  };

  it('crée, liste, relit et enregistre un projet', async () => {
    const project = await createProject();
    const list = await server.inject({ method: 'GET', url: '/api/projects' });
    expect(list.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: project.id, title: 'La lumière' })]),
    );

    const renamed = { ...project, title: 'La lumière blanche' };
    const saved = await server.inject({
      method: 'PUT',
      url: `/api/projects/${project.id}`,
      payload: { project: renamed },
    });
    expect(saved.statusCode).toBe(200);
    const read = await server.inject({ method: 'GET', url: `/api/projects/${project.id}` });
    expect(read.json()).toMatchObject({ title: 'La lumière blanche' });
  });

  it('refuse une sauvegarde invalide et un projet inconnu', async () => {
    const project = await createProject();
    const invalid = await server.inject({
      method: 'PUT',
      url: `/api/projects/${project.id}`,
      payload: { project: { ...project, scenes: [] } },
    });
    expect(invalid.statusCode).toBe(400);
    const unknown = await server.inject({ method: 'GET', url: '/api/projects/inconnu-123' });
    expect(unknown.statusCode).toBe(404);
  });

  it('importe une image puis la sert sur /files', async () => {
    const project = await createProject();
    const upload = await server.inject({
      method: 'POST',
      url: `/api/projects/${project.id}/assets?name=schema.svg`,
      headers: { 'content-type': 'image/svg+xml' },
      payload: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    });
    expect(upload.statusCode).toBe(201);
    const asset = upload.json<{ src: string; storage: string }>();
    expect(asset.storage).toBe('project');

    const file = await server.inject({ method: 'GET', url: `/files/${project.id}/${asset.src}` });
    expect(file.statusCode).toBe(200);
    expect(file.headers['content-type']).toBe('image/svg+xml');
    expect(file.body).toContain('<svg');

    const escape = await server.inject({ method: 'GET', url: `/files/${project.id}/..%2F..%2Fx` });
    expect(escape.statusCode).toBe(404);
  });

  it('duplique un projet', async () => {
    const project = await createProject();
    const copy = await server.inject({
      method: 'POST',
      url: `/api/projects/${project.id}/duplicate`,
      payload: { title: 'Copie' },
    });
    expect(copy.statusCode).toBe(201);
    expect(copy.json()).toMatchObject({ title: 'Copie' });
  });
});
