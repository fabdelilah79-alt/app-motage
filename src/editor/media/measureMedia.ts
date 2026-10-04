import type { MediaMeta } from '../api/client';

const TIMEOUT_MS = 8000;

/** Attend un événement de chargement, ou abandonne (mesure facultative) après quelques secondes. */
const waitFor = <T>(load: (resolve: (value: T) => void) => void, fallback: T): Promise<T> =>
  new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback), TIMEOUT_MS);
    load((value) => {
      window.clearTimeout(timer);
      resolve(value);
    });
  });

/**
 * Mesure un média dans le navigateur avant l'import : dimensions des images et vidéos,
 * durée des vidéos et des sons. Les lecteurs créés ici ne servent qu'à la mesure (éditeur).
 */
export const measureMedia = async (file: Blob): Promise<MediaMeta> => {
  const url = URL.createObjectURL(file);
  try {
    if (file.type.startsWith('image/')) {
      return await waitFor<MediaMeta>((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => resolve({});
        image.src = url;
      }, {});
    }
    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      const isVideo = file.type.startsWith('video/');
      return await waitFor<MediaMeta>((resolve) => {
        const media = document.createElement(isVideo ? 'video' : 'audio');
        media.preload = 'metadata';
        media.onloadedmetadata = () => {
          const duration = Number.isFinite(media.duration) ? media.duration : undefined;
          const video = media instanceof HTMLVideoElement ? media : null;
          resolve({
            durationInSeconds: duration,
            width: video?.videoWidth || undefined,
            height: video?.videoHeight || undefined,
          });
        };
        media.onerror = () => resolve({});
        media.src = url;
      }, {});
    }
    return {};
  } finally {
    URL.revokeObjectURL(url);
  }
};
