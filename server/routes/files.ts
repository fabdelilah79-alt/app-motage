import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { FastifyInstance } from 'fastify';
import { contentTypeFor } from '../projects/fileNames';
import type { ProjectStore } from '../projects/projectStore';

type FileParams = { Params: { id: string; '*': string } };

/**
 * Sert les fichiers d'un projet (images importées…) : /files/<projet>/<chemin>.
 * La même adresse sert à l'aperçu (via l'éditeur) et au rendu MP4 (Chrome headless).
 */
export const registerFileRoutes = (app: FastifyInstance, store: ProjectStore) => {
  app.get<FileParams>('/files/:id/*', async (request, reply) => {
    let file: string | null;
    try {
      file = store.resolveFile(request.params.id, request.params['*']);
    } catch {
      file = null;
    }
    const info = file ? await stat(file).catch(() => null) : null;
    if (!file || !info?.isFile()) {
      return reply.code(404).send({ error: 'not-found' });
    }
    return reply
      .header('Content-Type', contentTypeFor(file))
      .header('Content-Length', info.size)
      .header('Cache-Control', 'no-cache')
      .send(createReadStream(file));
  });
};
