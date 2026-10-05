import { z } from 'zod';
import { elementAnimationsSchema, propertyKeyframesSchema } from './animation';
import { frameCountSchema, idSchema, langSchema, positiveFrameCountSchema } from './common';
import { cropSchema, elementSoundSchema, kenBurnsSchema, mediaFrameShape } from './media';
import { textRunSchema, textStyleSchema } from './text';

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

const elementBaseShape = {
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

export const textElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('text'),
  lang: langSchema,
  /** « auto » : la direction découle de la langue (arabe → droite à gauche). */
  direction: z.enum(['auto', 'rtl', 'ltr']).default('auto'),
  content: z.array(textRunSchema).min(1),
  style: textStyleSchema.prefault({}),
  /** Préréglage de style appliqué en dernier (Titre, Définition…), pour information. */
  stylePresetId: z.string().optional(),
});
export type TextElement = z.infer<typeof textElementSchema>;

export const imageElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('image'),
  assetId: idSchema,
  ...mediaFrameShape,
  crop: cropSchema.prefault({}),
  kenBurns: kenBurnsSchema.prefault({}),
});
export type ImageElement = z.infer<typeof imageElementSchema>;

export const videoElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('video'),
  assetId: idSchema,
  ...mediaFrameShape,
  fit: z.enum(['cover', 'contain']).default('cover'),
  /** Début du découpage dans la vidéo d'origine (frames). La fin = début + durée de l'élément. */
  trimStart: frameCountSchema.default(0),
  playbackRate: z.number().min(0.25).max(4).default(1),
  volume: z.number().min(0).max(1).default(1),
  muted: z.boolean().default(false),
  loop: z.boolean().default(false),
});
export type VideoElement = z.infer<typeof videoElementSchema>;

/** GIF animé (et APNG / WebP animé), synchronisé avec la vidéo. */
export const gifElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('gif'),
  assetId: idSchema,
  fit: z.enum(['cover', 'contain']).default('contain'),
  playbackRate: z.number().min(0.25).max(4).default(1),
});
export type GifElement = z.infer<typeof gifElementSchema>;

export const lottieElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('lottie'),
  assetId: idSchema,
  loop: z.boolean().default(true),
  playbackRate: z.number().min(0.25).max(4).default(1),
});
export type LottieElement = z.infer<typeof lottieElementSchema>;

/** Icône de la bibliothèque intégrée (lucide). */
export const iconElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('icon'),
  iconId: z.string().min(1),
  color: z.string().default('#0f172a'),
  strokeWidth: z.number().min(0.5).max(6).default(2),
});
export type IconElement = z.infer<typeof iconElementSchema>;

export const shapeKindSchema = z.enum([
  'rectangle',
  'circle',
  'polygon',
  'star',
  'line',
  'arrow',
  'curvedArrow',
  'bubble',
]);
export type ShapeKind = z.infer<typeof shapeKindSchema>;

export const shapeElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('shape'),
  shape: shapeKindSchema,
  fill: z.string().default('#38bdf8'),
  stroke: z.string().default('#0f172a'),
  strokeWidth: z.number().min(0).max(40).default(4),
  /** Nombre de côtés (polygone) ou de branches (étoile). */
  sides: z.number().int().min(3).max(12).default(5),
});
export type ShapeElement = z.infer<typeof shapeElementSchema>;

export const sceneElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  imageElementSchema,
  videoElementSchema,
  gifElementSchema,
  lottieElementSchema,
  iconElementSchema,
  shapeElementSchema,
]);
export type SceneElement = z.infer<typeof sceneElementSchema>;
export type SceneElementInput = z.input<typeof sceneElementSchema>;
export type ElementType = SceneElement['type'];
