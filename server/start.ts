import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { buildServer } from './app';
import { SERVER_PORT } from './config';
import { registerEditorFiles } from './editorFiles';
import { openInFileExplorer } from './openFolder';
import { ROOT_DIR } from './paths';

// `npm start` (et les lanceurs « Lancer PhysiMotion ») : construit l'éditeur s'il a changé,
// démarre le serveur local sur http://localhost:3210 et ouvre le navigateur.
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const INDEX = path.join(DIST_DIR, 'index.html');

/** Date de la dernière modification d'un fichier du dossier (récursif). */
const newestChange = (dir: string): number =>
  readdirSync(dir, { withFileTypes: true }).reduce((latest, entry) => {
    const full = path.join(dir, entry.name);
    const time = entry.isDirectory() ? newestChange(full) : statSync(full).mtimeMs;
    return Math.max(latest, time);
  }, 0);

const needsBuild = () =>
  !existsSync(INDEX) ||
  newestChange(path.join(ROOT_DIR, 'src')) > statSync(INDEX).mtimeMs ||
  newestChange(path.join(ROOT_DIR, 'public')) > statSync(INDEX).mtimeMs;

if (needsBuild()) {
  console.log("Préparation de l'éditeur (une minute environ, seulement après une mise à jour)…");
  const { build } = await import('vite');
  await build({ root: ROOT_DIR, logLevel: 'warn' });
}

const server = buildServer({ logger: false });
registerEditorFiles(server, DIST_DIR);
const url = `http://localhost:${SERVER_PORT}`;
try {
  await server.listen({ port: SERVER_PORT, host: '127.0.0.1' });
} catch {
  console.error(
    `PhysiMotion est peut-être déjà ouvert (port ${SERVER_PORT} occupé). Ouvrez ${url} dans votre navigateur.`,
  );
  process.exit(1);
}
console.log(`PhysiMotion Studio est prêt : ${url}`);
console.log('Laissez cette fenêtre ouverte pendant votre travail. Pour arrêter : fermez-la.');
if (process.env.PHYSIMOTION_NO_BROWSER !== '1') openInFileExplorer(url);
