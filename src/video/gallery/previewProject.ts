import { parseProject, type Project } from '../../shared/schema';
import type { AnimationPreset } from '../animations/types';
import { sampleElement } from './sampleElement';

export const PREVIEW_FORMAT = { width: 480, height: 270, fps: 30 } as const;
export const PREVIEW_DURATION = 75;

/** Petite vidéo d'une seule scène montrant un préréglage (vignette et aperçu au survol). */
export const previewProject = (preset: AnimationPreset): Project =>
  parseProject({
    schemaVersion: 1,
    id: `apercu-${preset.id}`,
    title: preset.name.fr,
    format: PREVIEW_FORMAT,
    defaultLang: 'fr',
    scenes: [
      {
        id: 'apercu',
        durationInFrames: PREVIEW_DURATION,
        background: { type: 'color', color: '#f8fafc' },
        elements: [
          sampleElement(preset, 'exemple', { x: 140, y: 85, width: 200, height: 100 }, PREVIEW_DURATION, 0.5),
        ],
      },
    ],
  });

/** Image représentative pour la vignette : au milieu de l'animation. */
export const previewFrame = (preset: AnimationPreset): number => {
  const middle = Math.round(preset.defaultDuration / 2);
  switch (preset.category) {
    case 'enter':
      return 8 + middle;
    case 'exit':
      return PREVIEW_DURATION - 8 - middle;
    case 'emphasis':
    case 'motion':
      return Math.min(PREVIEW_DURATION - 1, 12 + middle);
  }
};
