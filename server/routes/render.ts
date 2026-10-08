import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { exportOptionsSchema } from '../../src/shared/exportOptions';
import { parseProject, type Project } from '../../src/shared/schema';
import { isFinished, type RenderJobManager, type RenderJobState } from '../render/jobs';

const renderRequestSchema = z.object({ project: z.unknown(), options: z.unknown().optional() });

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.gif': 'image/gif',
  '.png': 'image/png',
};

type JobParams = { Params: { id: string } };

/**
 * Routes d'export vidéo :
 * POST /api/render (lance un rendu), GET /api/render/:id (état),
 * GET /api/render/:id/events (progression en direct, SSE), DELETE /api/render/:id (annulation).
 */
export const registerRenderRoutes = (
  app: FastifyInstance,
  jobs: RenderJobManager,
  exportsDir: string,
  openFolder: (dir: string) => void,
) => {
  app.post('/api/render', async (request, reply) => {
    const body = renderRequestSchema.safeParse(request.body);
    let project: Project;
    try {
      project = parseProject(body.success ? body.data.project : undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.code(400).send({ error: 'invalid-project', message });
    }
    const options = exportOptionsSchema.safeParse((body.success ? body.data.options : undefined) ?? {});
    if (!options.success) {
      return reply.code(400).send({ error: 'invalid-options', message: options.error.message });
    }
    return reply.code(202).send(jobs.start(project, options.data));
  });

  app.get<JobParams>('/api/render/:id', async (request, reply) => {
    const state = jobs.get(request.params.id);
    if (!state) {
      return reply.code(404).send({ error: 'not-found' });
    }
    return state;
  });

  app.delete<JobParams>('/api/render/:id', async (request, reply) => {
    if (!jobs.get(request.params.id)) {
      return reply.code(404).send({ error: 'not-found' });
    }
    const cancelled = jobs.cancel(request.params.id);
    return reply.code(cancelled ? 200 : 409).send({ cancelled });
  });

  /** Téléchargement du fichier exporté (utile quand l'éditeur est ouvert depuis un autre PC). */
  app.get<JobParams>('/api/render/:id/file', async (request, reply) => {
    const state = jobs.get(request.params.id);
    if (!state || state.status !== 'done') {
      return reply.code(404).send({ error: 'not-found' });
    }
    try {
      const info = await stat(state.outputPath);
      const name = path.basename(state.outputPath);
      reply.header('Content-Type', CONTENT_TYPES[path.extname(name)] ?? 'application/octet-stream');
      reply.header('Content-Length', info.size);
      reply.header('Content-Disposition', `attachment; filename="${name}"`);
      return reply.send(createReadStream(state.outputPath));
    } catch {
      return reply.code(404).send({ error: 'not-found' });
    }
  });

  /** Ouvre le dossier des exports dans l'explorateur de fichiers de l'ordinateur. */
  app.post('/api/exports/open', async () => {
    openFolder(exportsDir);
    return { opened: true };
  });

  app.get<JobParams>('/api/render/:id/events', (request, reply) => {
    const initialState = jobs.get(request.params.id);
    if (!initialState) {
      reply.code(404).send({ error: 'not-found' });
      return;
    }

    reply.hijack();
    const stream = reply.raw;
    stream.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let unsubscribe: (() => void) | undefined;
    const send = (state: RenderJobState) => {
      stream.write(`data: ${JSON.stringify(state)}\n\n`);
      if (isFinished(state.status)) {
        unsubscribe?.();
        stream.end();
      }
    };

    send(initialState);
    if (isFinished(initialState.status)) {
      return;
    }
    unsubscribe = jobs.subscribe(request.params.id, send);
    stream.on('close', () => unsubscribe?.());
  });
};
