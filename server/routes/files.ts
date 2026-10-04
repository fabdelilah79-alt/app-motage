import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import type { FastifyInstance } from 'fastify';
import { contentTypeFor, parseRange } from '../projects/fileNames';
import type { ProjectStore } from '../projects/projectStore';

type FileParams = { Params: { id: string; '*': string } };

/** En-têtes permettant à Chrome headless (autre origine pendant l'export) de lire les médias. */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Range',
  'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
};

/**
 * Sert les fichiers d'un projet (images, vidéos, sons…) : /files/<projet>/<chemin>.
 * La même adresse sert à l'aperçu (via l'éditeur) et au rendu MP4. Les demandes partielles
 * (« Range ») sont prises en charge : indispensable pour se déplacer dans une vidéo ou un son.
 */
export const registerFileRoutes = (app: FastifyInstance, store: ProjectStore) => {
  app.options('/files/*', async (_request, reply) => reply.code(204).headers(CORS_HEADERS).send());

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
    reply
      .headers(CORS_HEADERS)
      .header('Content-Type', contentTypeFor(file))
      .header('Accept-Ranges', 'bytes')
      .header('Cache-Control', 'no-cache');

    const range = parseRange(request.headers.range, info.size);
    if (request.headers.range && !range) {
      return reply.code(416).header('Content-Range', `bytes */${info.size}`).send();
    }
    if (range) {
      return reply
        .code(206)
        .header('Content-Range', `bytes ${range.start}-${range.end}/${info.size}`)
        .header('Content-Length', range.end - range.start + 1)
        .send(createReadStream(file, { start: range.start, end: range.end }));
    }
    return reply.header('Content-Length', info.size).send(createReadStream(file));
  });
};
