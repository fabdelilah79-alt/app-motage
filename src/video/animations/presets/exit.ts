import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';
import type { AnimationPreset } from '../types';
import { wipeInsets } from './enterBasic';

/**
 * Disparitions symétriques des apparitions : la même animation jouée à l'envers.
 * Ex. « exit.slide » avec side = bottom : l'élément part vers le bas.
 */
export const mirrorAsExit = (enter: AnimationPreset): AnimationPreset => ({
  ...enter,
  id: enter.id.replace(/^enter\./, 'exit.'),
  category: 'exit',
  run: (progress, rawParams) => enter.run(1 - progress, rawParams),
});

export const exitShrink = definePreset({
  id: 'exit.shrink',
  name: { fr: 'Rétrécir en point', ar: 'انكماش إلى نقطة', en: 'Shrink to a point' },
  category: 'exit',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: z.object({}),
  apply: (progress) =>
    frameWith({ scale: Math.max(0, 1 - progress), opacity: progress < 0.9 ? 1 : (1 - progress) * 10 }),
});

const SIDES = ['left', 'right', 'top', 'bottom'] as const;

/** Balayage : un masque recouvre l'élément vers le côté choisi. */
export const exitSweep = definePreset({
  id: 'exit.sweep',
  name: { fr: 'Balayage', ar: 'مسح', en: 'Sweep' },
  category: 'exit',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'side', kind: 'select', options: SIDES }],
  paramsSchema: z.object({ side: z.enum(SIDES).default('right') }),
  // Disparaître « vers la droite » : la partie gauche est cachée en premier.
  apply: (progress, { side }) => frameWith({ clip: wipeInsets(side, progress * 100) }),
});
