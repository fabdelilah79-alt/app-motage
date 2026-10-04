import { staticFile } from 'remotion';
import type { SfxId } from '../../shared/schema';

/** Fichier d'un effet sonore intégré (public/sfx, généré pour l'application). */
export const sfxSrc = (id: SfxId): string => staticFile(`sfx/${id}.wav`);
