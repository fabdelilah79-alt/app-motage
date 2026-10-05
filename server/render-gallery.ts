import path from 'node:path';
import { galleryProject } from '../src/video/gallery/galleryProject';
import { EXPORTS_DIR } from './paths';
import { buildOutputFileName } from './render/outputFileName';
import { renderProject } from './render/renderProject';

// `npm run render:gallery` : vidéo MP4 présentant toutes les animations du catalogue.
const project = galleryProject();
const outputPath = path.join(EXPORTS_DIR, buildOutputFileName('galerie-animations', new Date()));

console.log(`Galerie : ${project.scenes.length} scènes (la première fois, un navigateur est téléchargé)…`);
await renderProject(project, outputPath, {
  onStage: (stage) => {
    if (stage === 'rendering') console.log('Fabrication des images…');
  },
  onProgress: (progress) => {
    process.stdout.write(`\rProgression : ${Math.round(progress * 100)} %`);
  },
});
console.log(`\nVidéo créée : ${outputPath}`);
