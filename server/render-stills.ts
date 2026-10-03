import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseProject } from '../src/shared/schema';
import { EXPORTS_DIR, ROOT_DIR } from './paths';
import { buildOutputFileName } from './render/outputFileName';
import { renderStills } from './render/renderStills';

// `npm run stills:typography` : captures PNG de templates/typography-test.json à plusieurs
// instants, pour vérifier que les lettres arabes restent liées pendant toutes les animations.
const templatePath = path.join(ROOT_DIR, 'templates', 'typography-test.json');
const project = parseProject(JSON.parse(await readFile(templatePath, 'utf8')));
const folder = buildOutputFileName('captures-typographie', new Date()).replace(/\.mp4$/, '');
const outputDir = path.join(EXPORTS_DIR, folder);

// Scène 1 (arabe) : 0 → 149 ; scène 2 (latin, effets) : 140 → 289 (fondu de 10 images).
const frames = [0, 20, 40, 60, 75, 100, 149, 165, 185, 210, 289];

console.log('Préparation des captures (la première fois, un navigateur est téléchargé)…');
const files = await renderStills(project, outputDir, frames, 'chiffres-latins');
const arabicDigits = { ...project, digits: 'arabic-indic' as const };
files.push(...(await renderStills(arabicDigits, outputDir, [149], 'chiffres-arabes')));
console.log(`${files.length} captures créées dans : ${outputDir}`);
