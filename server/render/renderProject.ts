import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Project } from '../../src/shared/schema';
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

/** Rend un projet en MP4 (H.264) avec Chrome headless + FFmpeg, et renvoie le chemin du fichier. */
export const renderProject: RenderFunction = async (project, outputLocation, callbacks) => {
  callbacks.onStage?.('bundling');
  const serveUrl = await getServeUrl();
  const { renderMedia, selectComposition } = await import('@remotion/renderer');
  const inputProps = { project, filesBaseUrl: FILES_BASE_URL };
  const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

  callbacks.onStage?.('rendering');
  await mkdir(path.dirname(outputLocation), { recursive: true });
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    cancelSignal: callbacks.cancelSignal,
    onProgress: ({ progress }) => callbacks.onProgress?.(progress),
  });
  return outputLocation;
};
