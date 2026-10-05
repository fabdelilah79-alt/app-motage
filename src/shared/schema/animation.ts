import { z } from 'zod';
import { frameCountSchema, positiveFrameCountSchema } from './common';

/**
 * Accélérations (noms simples affichés dans l'interface) :
 * douce, vive, rebond, élastique, constante, ralentie.
 */
export const easingIdSchema = z.enum(['smooth', 'snappy', 'bounce', 'elastic', 'linear', 'slow']);
export type EasingId = z.infer<typeof easingIdSchema>;
export const EASING_IDS: readonly EasingId[] = easingIdSchema.options;

/** Référence à un préréglage d'animation du registre (src/video/animations). */
export const animationRefSchema = z.object({
  presetId: z.string().min(1),
  duration: positiveFrameCountSchema,
  /**
   * Apparition : délai après le début de l'élément. Disparition : avance sur la fin.
   * Mise en valeur / mouvement : moment de départ après le début de l'élément.
   */
  delay: frameCountSchema.default(0),
  easing: easingIdSchema.default('smooth'),
  params: z.record(z.string(), z.unknown()).default({}),
  /** Nombre de répétitions (mises en valeur et mouvements). */
  repeat: z.number().int().min(1).max(20).default(1),
});
export type AnimationRef = z.infer<typeof animationRefSchema>;

export const elementAnimationsSchema = z.object({
  enter: animationRefSchema.optional(),
  /** Mises en valeur et mouvements, joués pendant la vie de l'élément. */
  emphasis: z.array(animationRefSchema).default([]),
  exit: animationRefSchema.optional(),
});
export type ElementAnimations = z.infer<typeof elementAnimationsSchema>;

/** Image clé du mode Avancé : valeur d'une propriété à une frame (relative à l'élément). */
export const keyframeSchema = z.object({
  frame: frameCountSchema,
  value: z.union([z.number(), z.string()]),
  easing: easingIdSchema.default('smooth'),
});
export type Keyframe = z.infer<typeof keyframeSchema>;

export const KEYFRAME_PROPERTIES = ['x', 'y', 'scale', 'rotation', 'opacity', 'color'] as const;
export type KeyframeProperty = (typeof KEYFRAME_PROPERTIES)[number];

/** Images clés par propriété (mode Avancé) : elles remplacent la valeur fixe de la propriété. */
export const propertyKeyframesSchema = z.object({
  x: z.array(keyframeSchema).optional(),
  y: z.array(keyframeSchema).optional(),
  scale: z.array(keyframeSchema).optional(),
  rotation: z.array(keyframeSchema).optional(),
  opacity: z.array(keyframeSchema).optional(),
  color: z.array(keyframeSchema).optional(),
});
export type PropertyKeyframes = z.infer<typeof propertyKeyframesSchema>;

/** Mouvement de caméra de la scène : aller vers un cadrage (centre et zoom). */
export const cameraMoveSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['zoom', 'pan', 'travelling', 'reset']),
  from: frameCountSchema,
  duration: positiveFrameCountSchema,
  easing: easingIdSchema.default('smooth'),
  /** Centre visé, en proportion de la scène (0 à 1). */
  centerX: z.number().min(0).max(1).default(0.5),
  centerY: z.number().min(0).max(1).default(0.5),
  zoom: z.number().min(1).max(5).default(1),
});
export type CameraMove = z.infer<typeof cameraMoveSchema>;
