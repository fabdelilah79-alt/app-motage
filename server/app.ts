import path from 'node:path';
import Fastify from 'fastify';
import { createBrandStore } from './brand/brandStore';
import { DATA_DIR, EXPORTS_DIR, PROJECTS_DIR } from './paths';
import { createProjectStore } from './projects/projectStore';
import { createRenderJobManager, type RenderJobManager } from './render/jobs';
import { renderProject } from './render/renderProject';
import { registerBrandRoutes } from './routes/brand';
import { registerFileRoutes } from './routes/files';
import { registerProjectRoutes } from './routes/projects';
import { registerRenderRoutes } from './routes/render';
import { openInFileExplorer } from './openFolder';

type ServerOptions = {
  logger?: boolean;
  /** Remplaçables dans les tests (dossier temporaire, faux rendu). */
  projectsDir?: string;
  /** Dossier du kit de marque (par défaut <données>/marque). */
  brandDir?: string;
  jobs?: RenderJobManager;
  /** Ouverture d'un dossier dans l'explorateur (remplacée dans les tests). */
  openFolder?: (dir: string) => void;
};

export const buildServer = ({
  logger = false,
  projectsDir,
  brandDir,
  jobs,
  openFolder = openInFileExplorer,
}: ServerOptions = {}) => {
  const app = Fastify({ logger });
  const store = createProjectStore(projectsDir ?? PROJECTS_DIR);

  app.get('/api/health', async () => ({ status: 'ok', app: 'PhysiMotion Studio' }));

  registerProjectRoutes(app, store);
  registerFileRoutes(app, store);
  registerBrandRoutes(app, createBrandStore(brandDir ?? path.join(DATA_DIR, 'marque'), store));
  registerRenderRoutes(
    app,
    jobs ?? createRenderJobManager({ render: renderProject, exportsDir: EXPORTS_DIR }),
    EXPORTS_DIR,
    openFolder,
  );

  return app;
};
