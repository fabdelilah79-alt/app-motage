import Fastify from 'fastify';
import { EXPORTS_DIR } from './paths';
import { createRenderJobManager, type RenderJobManager } from './render/jobs';
import { renderProject } from './render/renderProject';
import { registerRenderRoutes } from './routes/render';

export const SERVER_PORT = 3210;

type ServerOptions = {
  logger?: boolean;
  /** Remplaçable dans les tests pour ne pas lancer de vrai rendu. */
  jobs?: RenderJobManager;
};

export const buildServer = ({ logger = false, jobs }: ServerOptions = {}) => {
  const app = Fastify({ logger });

  app.get('/api/health', async () => ({ status: 'ok', app: 'PhysiMotion Studio' }));

  registerRenderRoutes(
    app,
    jobs ?? createRenderJobManager({ render: renderProject, exportsDir: EXPORTS_DIR }),
  );

  return app;
};
