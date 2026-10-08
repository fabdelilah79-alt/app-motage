import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';

const TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.wav': 'audio/wav',
  '.wasm': 'application/wasm',
};

/** Chemin d'un fichier de l'éditeur construit, ou null s'il sort du dossier. */
export const editorFilePath = (distDir: string, urlPath: string): string | null => {
  const root = path.resolve(distDir);
  const clean = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const file = path.resolve(root, `.${clean}`);
  return file === root || file.startsWith(root + path.sep) ? file : null;
};

/**
 * Sert l'éditeur déjà construit (dossier dist/) : une seule adresse, http://localhost:3210,
 * pour l'éditeur, l'API et les médias. Toute adresse inconnue renvoie l'éditeur (index.html).
 */
export const registerEditorFiles = (app: FastifyInstance, distDir: string) => {
  app.get('/*', async (request, reply) => {
    const file = editorFilePath(distDir, request.url);
    const candidates = file && path.extname(file) ? [file] : [];
    candidates.push(path.join(distDir, 'index.html'));
    for (const candidate of candidates) {
      try {
        const data = await readFile(candidate);
        return reply.type(TYPES[path.extname(candidate)] ?? 'application/octet-stream').send(data);
      } catch {
        // Fichier absent : on essaie le suivant (puis index.html).
      }
    }
    return reply.code(404).send({ error: 'not-found' });
  });
};
