import { buildServer } from './app';
import { SERVER_PORT } from './config';

const server = buildServer({ logger: true });

try {
  await server.listen({ port: SERVER_PORT, host: '127.0.0.1' });
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
