import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';
import type { DecorationKind } from '../types';

const noParams = z.object({});
const bump = (progress: number) => Math.sin(Math.PI * progress);

export const emphasisPulse = definePreset({
  id: 'emphasis.pulse',
  name: { fr: 'Pulsation', ar: 'نبض', en: 'Pulse' },
  category: 'emphasis',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'amount', kind: 'number', min: 0.02, max: 0.5, step: 0.02 }],
  paramsSchema: z.object({ amount: z.number().min(0).max(1).default(0.12) }),
  apply: (progress, { amount }) => frameWith({ scale: 1 + amount * bump(progress) }),
});

export const emphasisShake = definePreset({
  id: 'emphasis.shake',
  name: { fr: 'Secousse', ar: 'اهتزاز', en: 'Shake' },
  category: 'emphasis',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'intensity', kind: 'number', min: 2, max: 100, step: 2 }],
  paramsSchema: z.object({ intensity: z.number().min(0).default(24) }),
  apply: (progress, { intensity }) =>
    frameWith({ translateX: intensity * Math.sin(2 * Math.PI * 6 * progress) * (1 - progress) }),
});

export const emphasisSwing = definePreset({
  id: 'emphasis.swing',
  name: { fr: 'Balancement', ar: 'تأرجح', en: 'Swing' },
  category: 'emphasis',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'angle', kind: 'number', min: 1, max: 45, step: 1 }],
  paramsSchema: z.object({ angle: z.number().default(10) }),
  apply: (progress, { angle }) => frameWith({ rotate: angle * Math.sin(2 * Math.PI * progress) }),
});

export const emphasisGrow = definePreset({
  id: 'emphasis.grow',
  name: { fr: 'Agrandir / réduire', ar: 'تكبير / تصغير', en: 'Grow / shrink' },
  category: 'emphasis',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'factor', kind: 'number', min: 0.3, max: 3, step: 0.1 }],
  paramsSchema: z.object({ factor: z.number().positive().default(1.3) }),
  apply: (progress, { factor }) => frameWith({ scale: 1 + (factor - 1) * bump(progress) }),
});

export const emphasisBlink = definePreset({
  id: 'emphasis.blink',
  name: { fr: 'Clignotement', ar: 'وميض', en: 'Blink' },
  category: 'emphasis',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  // Deux clignotements par répétition, l'élément ne disparaît jamais complètement.
  apply: (progress) =>
    frameWith({ opacity: 0.15 + 0.85 * (0.5 + 0.5 * Math.cos(4 * Math.PI * progress)) }),
});

export const emphasisColor = definePreset({
  id: 'emphasis.color',
  name: { fr: 'Changement de couleur', ar: 'تغيير اللون', en: 'Color change' },
  category: 'emphasis',
  defaultDuration: 20,
  compatibleElements: ['text', 'shape', 'icon'],
  arabicCompatible: true,
  holdAfter: true,
  paramFields: [{ key: 'color', kind: 'color' }],
  paramsSchema: z.object({ color: z.string().default('#ef4444') }),
  apply: (progress, { color }) => frameWith({ colorShift: { color, amount: progress } }),
});

export const emphasisGlow = definePreset({
  id: 'emphasis.glow',
  name: { fr: 'Lueur', ar: 'توهج', en: 'Glow' },
  category: 'emphasis',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [
    { key: 'color', kind: 'color' },
    { key: 'radius', kind: 'number', min: 4, max: 80, step: 4 },
  ],
  paramsSchema: z.object({ color: z.string().default('#38bdf8'), radius: z.number().default(24) }),
  apply: (progress, { color, radius }) =>
    frameWith({ glow: { color, radius: radius * bump(progress) } }),
});

/** Décorations dessinées autour de l'élément ; elles restent visibles une fois tracées. */
const decoration = (
  kind: DecorationKind,
  name: Record<'fr' | 'ar' | 'en', string>,
  defaultColor: string,
) =>
  definePreset({
    id: `emphasis.${kind}`,
    name,
    category: 'emphasis',
    defaultDuration: 25,
    compatibleElements: 'all',
    arabicCompatible: true,
    holdAfter: true,
    paramFields: [{ key: 'color', kind: 'color' }],
    paramsSchema: z.object({ color: z.string().default(defaultColor) }),
    apply: (progress, { color }) => frameWith({ decoration: { kind, progress, color } }),
  });

export const emphasisHighlight = decoration(
  'highlight',
  { fr: 'Surlignage marqueur', ar: 'تظليل بالقلم', en: 'Marker highlight' },
  '#fde047',
);
export const emphasisUnderline = decoration(
  'underline',
  { fr: 'Soulignement dessiné', ar: 'تسطير مرسوم', en: 'Drawn underline' },
  '#ef4444',
);
export const emphasisCircle = decoration(
  'circle',
  { fr: 'Entourer', ar: 'إحاطة بدائرة', en: 'Circle' },
  '#ef4444',
);
export const emphasisArrow = decoration(
  'arrow',
  { fr: 'Flèche qui pointe', ar: 'سهم يشير', en: 'Pointing arrow' },
  '#ef4444',
);
