import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { exportOptionsSchema, renderSettings, type ExportOptions } from '../../src/shared/exportOptions';
import type { Project } from '../../src/shared/schema';
import { projectSrt } from '../../src/shared/subtitles';
import { FILES_BASE_URL } from '../config';
import { ROOT_DIR } from '../paths';

export const COMPOSITION_ID = 'ProjectVideo';

/** Même forme que le signal d'annulation de Remotion : on lui confie la fonction d'arrêt. */
export type CancelSignal = (onCancel: () => void) => void;

export type RenderStage = 'bundling' | 'rendering';

export type RenderCallbacks = {
  onStage?: (stage: RenderStage) => void;
  /** Progression de 0 à 1. */
  onProgress?: (progress: number) => void;
  cancelSignal?: CancelSignal;
};

export type RenderFunction = (
  project: Project,
  outputLocation: string,
  callbacks: RenderCallbacks,
  options?: ExportOptions,
) => Promise<string>;

let serveUrlPromise: Promise<string> | null = null;

const createBundle = async (): Promise<string> => {
  // Import à la demande : le serveur démarre vite et les tests n'en dépendent pas.
  const { bundle } = await import('@remotion/bundler');
  return bundle({
    entryPoint: path.join(ROOT_DIR, 'src', 'video', 'remotion-entry.ts'),
    rootDir: ROOT_DIR,
    publicDir: path.join(ROOT_DIR, 'public'),
  });
};

/** Prépare le code de la vidéo (bundle) une seule fois par démarrage du serveur. */
export const getServeUrl = (): Promise<string> => {
  serveUrlPromise ??= createBundle().catch((error: unknown) => {
    serveUrlPromise = null;
    throw error;
  });
  return serveUrlPromise;
};

/** WebGL (scènes 3D) dans Chrome headless : moteur ANGLE, recommandé par Remotion. */
export const CHROMIUM_OPTIONS = { gl: 'angle' } as const;

/** Fichier .srt à côté de la vidéo (même nom, extension .srt). */
export const srtPathFor = (outputLocation: string) =>
  outputLocation.replace(/\.[a-z0-9]+$/i, '') + '.srt';

/**
 * Rend un projet : vidéo (MP4 H.264, WebM, GIF) ou image PNG, en entier, une scène ou un
 * intervalle, à la qualité et à la taille choisies. Écrit aussi le .srt si demandé.
 */
export const renderProject: RenderFunction = async (
  project,
  outputLocation,
  callbacks,
  options = exportOptionsSchema.parse({}),
) => {
  callbacks.onStage?.('bundling');
  const serveUrl = await getServeUrl();
  const { renderMedia, renderStill, selectComposition } = await import('@remotion/renderer');
  const inputProps = { project, filesBaseUrl: FILES_BASE_URL };
  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps,
    chromiumOptions: CHROMIUM_OPTIONS,
  });

  callbacks.onStage?.('rendering');
  await mkdir(path.dirname(outputLocation), { recursive: true });
  const settings = renderSettings(project, options);
  if (settings.kind === 'still') {
    await renderStill({
      composition,
      serveUrl,
      output: outputLocation,
      inputProps,
      frame: settings.frame,
      scale: settings.scale,
      imageFormat: 'png',
      chromiumOptions: CHROMIUM_OPTIONS,
    });
    callbacks.onProgress?.(1);
    return outputLocation;
  }
  await renderMedia({
    composition,
    serveUrl,
    codec: settings.codec,
    crf: settings.crf ?? undefined,
    scale: settings.scale,
    frameRange: settings.frameRange,
    everyNthFrame: settings.everyNthFrame,
    outputLocation,
    inputProps,
    chromiumOptions: CHROMIUM_OPTIONS,
    cancelSignal: callbacks.cancelSignal,
    onProgress: ({ progress }) => callbacks.onProgress?.(progress),
  });
  if (options.srt) {
    await writeFile(srtPathFor(outputLocation), projectSrt(project), 'utf8');
  }
  return outputLocation;
};
