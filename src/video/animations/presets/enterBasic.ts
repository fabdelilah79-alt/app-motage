import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';
import type { ClipInsets } from '../types';

const noParams = z.object({});
const SIDES = ['left', 'right', 'top', 'bottom'] as const;
const sideParam = z.enum(SIDES);

export const enterFade = definePreset({
  id: 'enter.fade',
  name: { fr: 'Fondu', ar: 'ظهور تدريجي', en: 'Fade' },
  category: 'enter',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ opacity: progress }),
});

const slideParams = z.object({
  /** Côté par lequel l'élément arrive. */
  side: sideParam.default('bottom'),
  /** Distance parcourue en pixels. */
  distance: z.number().min(0).default(120),
});

const offsetTowards = (side: (typeof SIDES)[number], distance: number) => {
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

export const enterSlide = definePreset({
  id: 'enter.slide',
  name: { fr: 'Glisser', ar: 'انزلاق', en: 'Slide' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [
    { key: 'side', kind: 'select', options: SIDES },
    { key: 'distance', kind: 'number', min: 0, max: 2000, step: 20 },
  ],
  paramsSchema: slideParams,
  apply: (progress, { side, distance }) => {
    const away = 1 - progress;
    const offset = offsetTowards(side, distance);
    return frameWith({ opacity: progress, translateX: offset.x * away, translateY: offset.y * away });
  },
});

export const enterZoomIn = definePreset({
  id: 'enter.zoomIn',
  name: { fr: 'Zoom avant', ar: 'تكبير', en: 'Zoom in' },
  category: 'enter',
  defaultDuration: 18,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ opacity: progress, scale: 0.3 + 0.7 * progress }),
});

export const enterZoomOut = definePreset({
  id: 'enter.zoomOut',
  name: { fr: 'Zoom arrière', ar: 'تصغير', en: 'Zoom out' },
  category: 'enter',
  defaultDuration: 18,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ opacity: progress, scale: 1.6 - 0.6 * progress }),
});

/** Courbe qui dépasse légèrement la cible avant de revenir (effet « pop »). */
const backOut = (t: number) => {
  const c1 = 1.70158;
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const enterPop = definePreset({
  id: 'enter.pop',
  name: { fr: 'Pop (rebond)', ar: 'قفزة', en: 'Pop' },
  category: 'enter',
  defaultDuration: 15,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ opacity: Math.min(1, progress * 3), scale: backOut(progress) }),
});

export const enterBlur = definePreset({
  id: 'enter.blur',
  name: { fr: 'Flou → net', ar: 'من الضبابية إلى الوضوح', en: 'Blur to sharp' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ opacity: progress, blur: 20 * (1 - progress) }),
});

export const enterRotate = definePreset({
  id: 'enter.rotate',
  name: { fr: 'Rotation', ar: 'دوران', en: 'Rotate' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'angle', kind: 'number', min: -720, max: 720, step: 15 }],
  paramsSchema: z.object({ angle: z.number().default(-90) }),
  apply: (progress, { angle }) =>
    frameWith({ opacity: progress, rotate: angle * (1 - progress), scale: 0.6 + 0.4 * progress }),
});

export const enterFlip = definePreset({
  id: 'enter.flip',
  name: { fr: 'Retournement 3D', ar: 'انقلاب ثلاثي الأبعاد', en: '3D flip' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'axis', kind: 'select', options: ['horizontal', 'vertical'] }],
  paramsSchema: z.object({ axis: z.enum(['horizontal', 'vertical']).default('horizontal') }),
  apply: (progress, { axis }) => {
    const angle = 90 * (1 - progress);
    return frameWith({
      opacity: Math.min(1, progress * 4),
      rotateY: axis === 'horizontal' ? angle : 0,
      rotateX: axis === 'vertical' ? angle : 0,
    });
  },
});

/** Oscillation amortie : 0 au départ, 1 à la fin, en dépassant plusieurs fois. */
const elasticOut = (t: number) => (t <= 0 ? 0 : 1 - Math.cos(t * Math.PI * 4.5) * Math.exp(-6 * t));

export const enterElastic = definePreset({
  id: 'enter.elastic',
  name: { fr: 'Élastique', ar: 'مطاطي', en: 'Elastic' },
  category: 'enter',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) =>
    frameWith({ opacity: Math.min(1, progress * 4), scale: progress >= 1 ? 1 : elasticOut(progress) }),
});

/** Masque qui découvre l'élément depuis un côté. */
export const wipeInsets = (side: (typeof SIDES)[number], hidden: number): ClipInsets => ({
  top: side === 'bottom' ? hidden : 0,
  right: side === 'left' ? hidden : 0,
  bottom: side === 'top' ? hidden : 0,
  left: side === 'right' ? hidden : 0,
});

export const enterWipe = definePreset({
  id: 'enter.wipe',
  name: { fr: 'Rideau / masque', ar: 'ستار / قناع', en: 'Wipe / mask' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'side', kind: 'select', options: SIDES }],
  paramsSchema: z.object({ side: sideParam.default('left') }),
  apply: (progress, { side }) => frameWith({ clip: wipeInsets(side, (1 - progress) * 100) }),
});
