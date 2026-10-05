import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { brandSchema } from '../../src/shared/schema';
import type { BrandStore } from '../brand/brandStore';

const saveSchema = z.object({ projectId: z.string().min(1), brand: brandSchema });

type IdParams = { Params: { id: string } };

/** Kit de marque : lecture, enregistrement depuis un projet, application à un projet. */
export const registerBrandRoutes = (app: FastifyInstance, brands: BrandStore) => {
  app.get('/api/brand', async () => ({ kit: await brands.get() }));

  app.put('/api/brand', async (request, reply) => {
    try {
      const { projectId, brand } = saveSchema.parse(request.body);
      return { kit: await brands.saveFromProject(projectId, brand) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.code(400).send({ error: 'invalid-request', message });
    }
  });

  app.post<IdParams>('/api/projects/:id/brand', async (request, reply) => {
    try {
      const result = await brands.applyToProject(request.params.id);
      if (!result) return reply.code(404).send({ error: 'no-brand-kit' });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return reply.code(400).send({ error: 'invalid-request', message });
    }
  });
};
