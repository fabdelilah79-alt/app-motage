import { staticFile } from 'remotion';

const ABSOLUTE_URL = /^(https?:|data:|blob:)/;

/** URL complète conservée telle quelle ; sinon chemin relatif au dossier public. */
export const resolveAssetSrc = (src: string): string =>
  ABSOLUTE_URL.test(src) ? src : staticFile(src);
