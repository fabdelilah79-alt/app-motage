import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { formatPresetIdSchema } from '../../src/shared/formats';
import { langSchema, parseProject } from '../../src/shared/schema';
import {
  ProjectNotFoundError,
  UnsupportedFileError,
  type ProjectStore,
} from '../projects/projectStore';

/** Taille maximale d'un média importé (les vidéos peuvent être lourdes). */
const MAX_MEDIA_BYTES = 1024 * 1024 * 1024;

const newProjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  formatId: formatPresetIdSchema,
  defaultLang: langSchema,
  fps: z.union([z.literal(30), z.literal(60)]).optional(),
  templateId: z.string().max(60).optional(),
});
const saveSchema = z.object({ project: z.unknown() });
const duplicateSchema = z.object({ title: z.string().trim().min(1).max(120) });
const optionalPositive = z.coerce.number().positive().optional();
const uploadQuerySchema = z.object({
  name: z.string().min(1).max(200).default('media'),
  // Mesures faites par le navigateur avant l'envoi (durée d'un son ou d'une vidéo, dimensions).
  duration: optionalPositive,
  width: optionalPositive,
  height: optionalPositive,
});

type IdParams = { Params: { id: string } };

/** Convertit les erreurs connues en réponses HTTP claires. */
const sendError = (reply: FastifyReply, error: unknown) => {
  if (error instanceof ProjectNotFoundError) {
    return reply.code(404).send({ error: 'not-found' });
  }
  if (error instanceof UnsupportedFileError) {
    return reply.code(415).send({ error: 'unsupported-file' });
  }
  const message = error instanceof Error ? error.message : String(error);
  return reply.code(400).send({ error: 'invalid-request', message });
};

/** Projets enregistrés sur le disque : liste, création, lecture, sauvegarde, copie, images. */
export const registerProjectRoutes = (app: FastifyInstance, store: ProjectStore) => {
  // Les médias importés arrivent tels quels dans le corps de la requête.
  app.addContentTypeParser(
    /^(image|video|audio)\/|^application\/x-lottie\+json/,
    { parseAs: 'buffer', bodyLimit: MAX_MEDIA_BYTES },
    (_request, body, done) => done(null, body),
  );

  app.get('/api/projects', async () => store.list());

  app.post('/api/projects', async (request, reply) => {
    try {
      const input = newProjectSchema.parse(request.body);
      return reply.code(201).send(await store.create(input));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get<IdParams>('/api/projects/:id', async (request, reply) => {
    try {
      return await store.read(request.params.id);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.put<IdParams>('/api/projects/:id', async (request, reply) => {
    try {
      const project = parseProject(saveSchema.parse(request.body).project);
      return await store.save(request.params.id, project);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post<IdParams>('/api/projects/:id/duplicate', async (request, reply) => {
    try {
      const { title } = duplicateSchema.parse(request.body);
      return reply.code(201).send(await store.duplicate(request.params.id, title));
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.post<IdParams>('/api/projects/:id/assets', async (request, reply) => {
    try {
      const { name, duration, width, height } = uploadQuerySchema.parse(request.query);
      const contentType = (request.headers['content-type'] ?? '').split(';')[0] ?? '';
      if (!Buffer.isBuffer(request.body)) {
        throw new UnsupportedFileError(contentType);
      }
      const meta = { durationInSeconds: duration, width, height };
      const asset = await store.addAsset(request.params.id, name, contentType, request.body, meta);
      return reply.code(201).send(asset);
    } catch (error) {
      return sendError(reply, error);
    }
  });
};
