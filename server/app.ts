import Fastify from 'fastify';
import { EXPORTS_DIR, PROJECTS_DIR } from './paths';
import { createProjectStore } from './projects/projectStore';
import { createRenderJobManager, type RenderJobManager } from './render/jobs';
import { renderProject } from './render/renderProject';
import { registerFileRoutes } from './routes/files';
import { registerProjectRoutes } from './routes/projects';
import { registerRenderRoutes } from './routes/render';

type ServerOptions = {
  logger?: boolean;
  /** Remplaçables dans les tests (dossier temporaire, faux rendu). */
  projectsDir?: string;
  jobs?: RenderJobManager;
};

export const buildServer = ({ logger = false, projectsDir, jobs }: ServerOptions = {}) => {
  const app = Fastify({ logger });
  const store = createProjectStore(projectsDir ?? PROJECTS_DIR);

  app.get('/api/health', async () => ({ status: 'ok', app: 'PhysiMotion Studio' }));

  registerProjectRoutes(app, store);
  registerFileRoutes(app, store);
  registerRenderRoutes(
    app,
    jobs ?? createRenderJobManager({ render: renderProject, exportsDir: EXPORTS_DIR }),
  );

  return app;
};
