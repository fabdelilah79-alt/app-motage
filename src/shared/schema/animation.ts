import { z } from 'zod';
import { frameCountSchema, positiveFrameCountSchema } from './common';

/** Accélérations disponibles (noms simples affichés dans l'interface). */
export const easingIdSchema = z.enum(['smooth', 'snappy', 'linear']);
export type EasingId = z.infer<typeof easingIdSchema>;

/** Référence à un préréglage d'animation du registre (src/video/animations). */
export const animationRefSchema = z.object({
  presetId: z.string().min(1),
  duration: positiveFrameCountSchema,
  delay: frameCountSchema.default(0),
  easing: easingIdSchema.default('smooth'),
  params: z.record(z.string(), z.unknown()).default({}),
});
export type AnimationRef = z.infer<typeof animationRefSchema>;

export const elementAnimationsSchema = z.object({
  enter: animationRefSchema.optional(),
  exit: animationRefSchema.optional(),
});
export type ElementAnimations = z.infer<typeof elementAnimationsSchema>;
