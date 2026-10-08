import { random } from 'remotion';
import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';

const noParams = z.object({});
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Tracé du contour sur [0, split], puis remplissage sur [split, 1]. */
const drawFrame = (progress: number, split: number) =>
  frameWith({
    draw: { stroke: clamp01(progress / split), fill: clamp01((progress - split) / (1 - split)) },
  });

export const enterDraw = definePreset({
  id: 'enter.draw',
  name: { fr: 'Tracé', ar: 'رسم الحدود', en: 'Draw' },
  category: 'enter',
  defaultDuration: 40,
  compatibleElements: ['shape', 'icon', 'math', 'vector', 'dimension', 'diagram'],
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => drawFrame(progress, 0.85),
});

export const enterHandwriting = definePreset({
  id: 'enter.handwriting',
  name: { fr: 'Écriture à la main', ar: 'كتابة يدوية', en: 'Handwriting' },
  category: 'enter',
  defaultDuration: 50,
  compatibleElements: ['shape', 'icon', 'math', 'vector', 'dimension', 'diagram'],
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => drawFrame(progress, 0.6),
});

/**
 * Glitch : secousses et décalage de couleurs qui s'atténuent. Le hasard vient de
 * `random(seed)` de Remotion : la même progression donne toujours le même résultat.
 */
export const enterGlitch = definePreset({
  id: 'enter.glitch',
  name: { fr: 'Glitch', ar: 'تشويش رقمي', en: 'Glitch' },
  category: 'enter',
  defaultDuration: 20,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => {
    if (progress >= 1) return frameWith({});
    const step = Math.round(progress * 40);
    const intensity = 1 - progress;
    const jitter = (random(`glitch-x-${step}`) - 0.5) * 40 * intensity;
    const visible = progress > 0.6 || random(`glitch-o-${step}`) > 0.3;
    return frameWith({
      opacity: progress === 0 ? 0 : visible ? 1 : 0.25,
      translateX: jitter,
      glitch: intensity,
    });
  },
});

/** Compteur : les nombres du texte défilent de 0 jusqu'à leur valeur (ex. v = 0 → 12,5 m/s). */
export const enterCounter = definePreset({
  id: 'enter.counter',
  name: { fr: 'Compteur', ar: 'عدّاد', en: 'Counter' },
  category: 'enter',
  defaultDuration: 45,
  compatibleElements: ['text'],
  arabicCompatible: true,
  paramsSchema: noParams,
  apply: (progress) => frameWith({ counter: progress }),
});
