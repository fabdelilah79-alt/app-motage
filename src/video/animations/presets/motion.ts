import { z } from 'zod';
import { definePreset } from '../definePreset';
import { frameWith } from '../frame';
import { PATH_FORMS, pathPoints, pointAlong } from '../motionPath';

export const motionMove = definePreset({
  id: 'motion.move',
  name: { fr: 'Déplacement A → B', ar: 'انتقال من أ إلى ب', en: 'Move A → B' },
  category: 'motion',
  defaultDuration: 30,
  compatibleElements: 'all',
  arabicCompatible: true,
  holdAfter: true,
  paramFields: [
    { key: 'dx', kind: 'number', min: -4000, max: 4000, step: 20 },
    { key: 'dy', kind: 'number', min: -4000, max: 4000, step: 20 },
  ],
  paramsSchema: z.object({ dx: z.number().default(400), dy: z.number().default(0) }),
  apply: (progress, { dx, dy }) => frameWith({ translateX: dx * progress, translateY: dy * progress }),
});

export const motionPath = definePreset({
  id: 'motion.path',
  name: { fr: 'Le long d’un chemin', ar: 'على طول مسار', en: 'Along a path' },
  category: 'motion',
  defaultDuration: 45,
  compatibleElements: 'all',
  arabicCompatible: true,
  holdAfter: true,
  paramFields: [
    { key: 'form', kind: 'select', options: PATH_FORMS },
    { key: 'width', kind: 'number', min: -4000, max: 4000, step: 20 },
    { key: 'height', kind: 'number', min: -2000, max: 2000, step: 20 },
  ],
  paramsSchema: z.object({
    form: z.enum(PATH_FORMS).default('arc'),
    width: z.number().default(600),
    height: z.number().default(250),
    /** Points saisis « x,y x,y … » pour la forme « custom ». */
    points: z.string().default('0,0 300,-200 600,0'),
  }),
  apply: (progress, { form, width, height, points }) => {
    const position = pointAlong(pathPoints(form, width, height, points), progress);
    return frameWith({ translateX: position.x, translateY: position.y });
  },
});

export const motionOrbit = definePreset({
  id: 'motion.orbit',
  name: { fr: 'Orbite', ar: 'مدار', en: 'Orbit' },
  category: 'motion',
  defaultDuration: 60,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'radius', kind: 'number', min: 10, max: 2000, step: 10 }],
  paramsSchema: z.object({ radius: z.number().default(150) }),
  // Un tour complet ; le départ et l'arrivée sont la position d'origine.
  apply: (progress, { radius }) => {
    const angle = 2 * Math.PI * progress;
    return frameWith({
      translateX: radius * Math.cos(angle) - radius,
      translateY: radius * Math.sin(angle),
    });
  },
});

export const motionFloat = definePreset({
  id: 'motion.float',
  name: { fr: 'Flottement', ar: 'طفو', en: 'Float' },
  category: 'motion',
  defaultDuration: 60,
  compatibleElements: 'all',
  arabicCompatible: true,
  paramFields: [{ key: 'amplitude', kind: 'number', min: 2, max: 200, step: 2 }],
  paramsSchema: z.object({ amplitude: z.number().default(16) }),
  apply: (progress, { amplitude }) =>
    frameWith({ translateY: -amplitude * Math.sin(2 * Math.PI * progress) }),
});
