import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Project } from '../../src/shared/schema';
import { FILES_BASE_URL } from '../config';
import { COMPOSITION_ID, getServeUrl } from './renderProject';

/**
 * Rend des images fixes (PNG) d'un projet à plusieurs frames : sert à vérifier visuellement
 * le rendu final (liaisons arabes, ordre bidi, effets) exactement comme dans le MP4.
 */
export const renderStills = async (
  project: Project,
  outputDir: string,
  frames: readonly number[],
  prefix: string,
): Promise<string[]> => {
  const serveUrl = await getServeUrl();
  const { renderStill, selectComposition } = await import('@remotion/renderer');
  const inputProps = { project, filesBaseUrl: FILES_BASE_URL };
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });
  await mkdir(outputDir, { recursive: true });

  const files: string[] = [];
  for (const frame of frames) {
    const safeFrame = Math.min(Math.max(0, frame), composition.durationInFrames - 1);
    const name = `${prefix}-image-${String(safeFrame).padStart(4, '0')}.png`;
    const output = path.join(outputDir, name);
    await renderStill({ composition, serveUrl, output, inputProps, frame: safeFrame });
    files.push(output);
  }
  return files;
};
