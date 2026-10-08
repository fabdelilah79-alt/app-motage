import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseProject } from '../src/shared/schema';
import { EXPORTS_DIR, ROOT_DIR } from './paths';
import { buildOutputFileName } from './render/outputFileName';
import { renderProject } from './render/renderProject';

// `tsx server/render-template.ts templates/<modèle>.json` : rend un modèle en MP4 dans
// ~/PhysiMotion/exports/ (ex. `npm run render:science` pour la vidéo « Énergie cinétique »).
const relative = process.argv[2];
if (!relative) {
  console.error('Indiquez le fichier du modèle, ex. templates/energie-cinetique.json');
  process.exit(1);
}
const raw: unknown = JSON.parse(await readFile(path.resolve(ROOT_DIR, relative), 'utf8'));
const project = parseProject(raw);
const outputPath = path.join(EXPORTS_DIR, buildOutputFileName(project.title, new Date()));

console.log('Préparation de la vidéo (la première fois, un navigateur est téléchargé)…');
await renderProject(project, outputPath, {
  onProgress: (progress) => {
    process.stdout.write(`\rProgression : ${Math.round(progress * 100)} %`);
  },
});
console.log(`\nVidéo créée : ${outputPath}`);
