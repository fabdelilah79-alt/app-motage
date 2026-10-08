import { z } from 'zod';
import { elementAnimationsSchema, propertyKeyframesSchema } from './animation';
import { frameCountSchema, idSchema, positiveFrameCountSchema } from './common';
import { elementSoundSchema } from './media';

/** Position et taille en pixels de la composition (coin supérieur gauche). */
export const transformSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  scale: z.number().positive().default(1),
  opacity: z.number().min(0).max(1).default(1),
});
export type Transform = z.infer<typeof transformSchema>;

/** Moment d'apparition de l'élément, en frames, relatif au début de la scène. */
export const timingSchema = z.object({
  from: frameCountSchema,
  duration: positiveFrameCountSchema,
});
export type Timing = z.infer<typeof timingSchema>;

/** Champs communs à tous les éléments. */
export const elementBaseShape = {
  id: idSchema,
  name: z.string().default(''),
  locked: z.boolean().default(false),
  hidden: z.boolean().default(false),
  transform: transformSchema,
  timing: timingSchema,
  animations: elementAnimationsSchema.prefault({}),
  /** Effet sonore joué au début de l'apparition. */
  sound: elementSoundSchema.optional(),
  /** Images clés du mode Avancé. */
  keyframes: propertyKeyframesSchema.optional(),
};
