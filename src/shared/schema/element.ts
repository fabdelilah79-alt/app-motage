import { z } from 'zod';
import { elementAnimationsSchema } from './animation';
import { frameCountSchema, idSchema, langSchema, positiveFrameCountSchema } from './common';

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
};

export const textStyleSchema = z.object({
  /** Police imposée ; sinon police par défaut de la langue du texte. */
  fontFamily: z.string().optional(),
  fontSize: z.number().positive().default(64),
  fontWeight: z.number().int().min(100).max(900).default(400),
  color: z.string().default('#ffffff'),
  /** « start » = début de ligne dans le sens de lecture (droite en arabe). */
  align: z.enum(['start', 'center', 'end']).default('start'),
  lineHeight: z.number().positive().default(1.4),
});
export type TextStyle = z.infer<typeof textStyleSchema>;

export const textRunStyleSchema = z.object({
  color: z.string().optional(),
  fontWeight: z.number().int().min(100).max(900).optional(),
});

export const textRunSchema = z.object({
  kind: z.literal('text'),
  text: z.string(),
  style: textRunStyleSchema.optional(),
});
export type TextRun = z.infer<typeof textRunSchema>;

export const textElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('text'),
  lang: langSchema,
  /** « auto » : la direction découle de la langue (arabe → droite à gauche). */
  direction: z.enum(['auto', 'rtl', 'ltr']).default('auto'),
  content: z.array(textRunSchema).min(1),
  style: textStyleSchema.prefault({}),
});
export type TextElement = z.infer<typeof textElementSchema>;

export const imageElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('image'),
  assetId: idSchema,
  fit: z.enum(['cover', 'contain']).default('contain'),
});
export type ImageElement = z.infer<typeof imageElementSchema>;

export const sceneElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  imageElementSchema,
]);
export type SceneElement = z.infer<typeof sceneElementSchema>;
export type ElementType = SceneElement['type'];
