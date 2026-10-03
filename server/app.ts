import Fastify from 'fastify';

export const SERVER_PORT = 3210;

// Serveur local minimal (phase 0). Projets, fichiers et rendu vidéo arrivent en phase 1–2.
export const buildServer = (options: { logger: boolean } = { logger: false }) => {
  const app = Fastify({ logger: options.logger });

  app.get('/api/health', async () => ({ status: 'ok', app: 'PhysiMotion Studio' }));

  return app;
};
