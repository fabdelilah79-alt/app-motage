import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseProject } from '../src/shared/schema';
import { THEMES } from '../src/video/themes/themes';
import { EXPORTS_DIR, ROOT_DIR } from './paths';
import { buildOutputFileName } from './render/outputFileName';
import { renderStills } from './render/renderStills';

// `npm run render:themes` : la même scène (templates/theme-test.json) rendue en PNG dans les
// 9 thèmes. Seul le thème change : fonds, couleurs, polices et style des formes doivent suivre.
const templatePath = path.join(ROOT_DIR, 'templates', 'theme-test.json');
const project = parseProject(JSON.parse(await readFile(templatePath, 'utf8')));
const folder = buildOutputFileName('captures-themes', new Date()).replace(/\.mp4$/, '');
const outputDir = path.join(EXPORTS_DIR, folder);

console.log('Préparation des captures (la première fois, un navigateur est téléchargé)…');
const files: string[] = [];
for (const theme of THEMES) {
  const themed = { ...project, themeId: theme.id };
  files.push(...(await renderStills(themed, outputDir, [60], theme.id)));
  console.log(`  ✓ ${theme.name.fr}`);
}
console.log(`${files.length} captures créées dans : ${outputDir}`);
