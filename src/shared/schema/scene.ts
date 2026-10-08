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

export const textureSchema = z.enum(['paper', 'slate', 'grid', 'lined', 'dots', 'blueprint']);
export type Texture = z.infer<typeof textureSchema>;

/**
 * Fond d'une scène. « theme » : fond du thème du projet (il change avec le thème).
 * Les couleurs peuvent aussi désigner une couleur du thème : « theme.accent1 »…
 */
export const backgroundSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('theme') }),
  z.object({ type: z.literal('color'), color: z.string() }),
  z.object({
    type: z.literal('linear-gradient'),
    /** Angle CSS en degrés (180 = de haut en bas). */
    angle: z.number().default(180),
    stops: z.array(gradientStopSchema).min(2),
  }),
  z.object({ type: z.literal('texture'), texture: textureSchema, color: z.string() }),
  z.object({
    type: z.literal('particles'),
    color: z.string(),
    particleColor: z.string(),
    count: z.number().int().min(1).max(400).default(60),
    seed: z.string().default('particules'),
  }),
  z.object({
    type: z.literal('image'),
    assetId: idSchema,
    fit: z.enum(['cover', 'contain']).default('cover'),
  }),
  z.object({ type: z.literal('video'), assetId: idSchema }),
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

/** Sous-titre d'une scène : texte affiché de `from` à `to` (frames relatives à la scène). */
export const subtitleCueSchema = z.object({
  id: idSchema,
  from: z.number().int().min(0),
  to: z.number().int().min(0),
  text: z.string(),
});
export type SubtitleCue = z.infer<typeof subtitleCueSchema>;

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
  /** Sous-titres (saisis, tirés du script ou transcrits automatiquement). */
  subtitles: z.array(subtitleCueSchema).default([]),
});
export type Scene = z.infer<typeof sceneSchema>;
export type SceneInput = z.input<typeof sceneSchema>;
