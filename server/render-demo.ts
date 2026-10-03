import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseProject } from '../src/shared/schema';
import { EXPORTS_DIR, ROOT_DIR } from './paths';
import { buildOutputFileName } from './render/outputFileName';
import { renderProject } from './render/renderProject';

// `npm run render:demo` : rend templates/demo.json en MP4 dans ~/PhysiMotion/exports/.
const templatePath = path.join(ROOT_DIR, 'templates', 'demo.json');
const raw: unknown = JSON.parse(await readFile(templatePath, 'utf8'));
const project = parseProject(raw);
const outputPath = path.join(EXPORTS_DIR, buildOutputFileName(project.title, new Date()));

console.log('Préparation de la vidéo (la première fois, un navigateur est téléchargé)…');
await renderProject(project, outputPath, {
  onStage: (stage) => {
    if (stage === 'rendering') {
      console.log('Fabrication des images…');
    }
  },
  onProgress: (progress) => {
    process.stdout.write(`\rProgression : ${Math.round(progress * 100)} %`);
  },
});
console.log(`\nVidéo créée : ${outputPath}`);
