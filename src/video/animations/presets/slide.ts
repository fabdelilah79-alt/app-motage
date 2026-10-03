import { z } from 'zod';
import { definePreset } from '../definePreset';
import type { AnimationFrame } from '../types';

const slideParams = z.object({
  /** Côté par lequel l'élément arrive (apparition) ou part (disparition). */
  side: z.enum(['left', 'right', 'top', 'bottom']).default('bottom'),
  /** Distance parcourue en pixels. */
  distance: z.number().min(0).default(120),
});
type SlideParams = z.output<typeof slideParams>;

const offsetTowards = ({ side, distance }: SlideParams): { x: number; y: number } => {
  switch (side) {
    case 'left':
      return { x: -distance, y: 0 };
    case 'right':
      return { x: distance, y: 0 };
    case 'top':
      return { x: 0, y: -distance };
    case 'bottom':
      return { x: 0, y: distance };
  }
};

/** Glissement accompagné d'un fondu ; `away` = 0 en place, 1 complètement décalé. */
const slideFrame = (away: number, params: SlideParams): AnimationFrame => {
  const offset = offsetTowards(params);
  return {
    opacity: 1 - away,
    translateX: offset.x * away,
    translateY: offset.y * away,
    scale: 1,
  };
};

export const enterSlide = definePreset({
  id: 'enter.slide',
  name: { fr: 'Glisser', ar: 'انزلاق', en: 'Slide' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: slideParams,
  apply: (progress, params) => slideFrame(1 - progress, params),
});

export const exitSlide = definePreset({
  id: 'exit.slide',
  name: { fr: 'Glisser', ar: 'انزلاق', en: 'Slide' },
  category: 'exit',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: slideParams,
  apply: (progress, params) => slideFrame(progress, params),
});
