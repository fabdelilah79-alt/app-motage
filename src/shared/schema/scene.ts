import { z } from 'zod';
import { cameraMoveSchema } from './animation';
import { idSchema, positiveFrameCountSchema } from './common';
import { sceneElementSchema } from './element';
import { voiceoverSchema } from './media';

export const gradientStopSchema = z.object({
  color: z.string(),
  /** Position en pourcentage (0 à 100). */
  position: z.number().min(0).max(100),
});

export const backgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('color'), color: z.string() }),
  z.object({
    type: z.literal('linear-gradient'),
    /** Angle CSS en degrés (180 = de haut en bas). */
    angle: z.number().default(180),
    stops: z.array(gradientStopSchema).min(2),
  }),
]);
export type Background = z.infer<typeof backgroundSchema>;

export const transitionTypeSchema = z.enum([
  'none',
  'fade',
  'slide',
  'wipe',
  'zoom',
  'flip',
  'clockWipe',
  'iris',
]);
export type TransitionType = z.infer<typeof transitionTypeSchema>;

export const transitionDirectionSchema = z.enum([
  'from-left',
  'from-right',
  'from-top',
  'from-bottom',
]);
export type TransitionDirection = z.infer<typeof transitionDirectionSchema>;

/** Transition qui mène à cette scène depuis la précédente (ignorée pour la première scène). */
export const sceneTransitionSchema = z.object({
  type: transitionTypeSchema,
  durationInFrames: positiveFrameCountSchema.default(15),
  direction: transitionDirectionSchema.default('from-right'),
});
export type SceneTransition = z.infer<typeof sceneTransitionSchema>;

export const sceneSchema = z.object({
  id: idSchema,
  name: z.string().default(''),
  durationInFrames: positiveFrameCountSchema,
  background: backgroundSchema.default({ type: 'color', color: '#ffffff' }),
  transitionIn: sceneTransitionSchema.optional(),
  /** Ordre du tableau = profondeur (le dernier est devant). */
  elements: z.array(sceneElementSchema).default([]),
  /** Texte de la voix off / notes de l'enseignant. */
  script: z.string().optional(),
  voiceover: voiceoverSchema.optional(),
  /** Mouvements de caméra (zoom sur une zone, panoramique, travelling, retour au plan large). */
  camera: z.array(cameraMoveSchema).default([]),
});
export type Scene = z.infer<typeof sceneSchema>;
export type SceneInput = z.input<typeof sceneSchema>;
