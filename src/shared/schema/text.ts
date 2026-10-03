import { z } from 'zod';

const colorSchema = z.string();
const weightSchema = z.number().int().min(100).max(900);

/** Effets de texte (facultatifs) : contour, ombre, lueur, dégradé, fond, surlignage, soulignement. */
export const textEffectsSchema = z.object({
  stroke: z.object({ color: colorSchema, width: z.number().min(0).max(40) }).optional(),
  shadow: z
    .object({
      color: colorSchema,
      blur: z.number().min(0).default(12),
      offsetX: z.number().default(4),
      offsetY: z.number().default(6),
    })
    .optional(),
  glow: z.object({ color: colorSchema, radius: z.number().min(0).default(18) }).optional(),
  gradient: z
    .object({ from: colorSchema, to: colorSchema, angle: z.number().default(90) })
    .optional(),
  background: z
    .object({
      kind: z.enum(['band', 'pill', 'card']),
      color: colorSchema,
      /** Marge intérieure en pixels. */
      padding: z.number().min(0).default(24),
    })
    .optional(),
  highlight: z.object({ color: colorSchema }).optional(),
  underline: z
    .object({ color: colorSchema.optional(), thickness: z.number().min(1).default(6) })
    .optional(),
});
export type TextEffects = z.infer<typeof textEffectsSchema>;

export const textStyleSchema = z.object({
  /** Police du catalogue (src/video/text/fontCatalog.ts) ; sinon police par défaut de la langue. */
  fontId: z.string().optional(),
  /** Famille CSS libre (usage avancé), utilisée si `fontId` est absent. */
  fontFamily: z.string().optional(),
  fontSize: z.number().positive().default(64),
  fontWeight: weightSchema.default(400),
  color: colorSchema.default('#ffffff'),
  /** « start » = début de ligne dans le sens de lecture (droite en arabe). */
  align: z.enum(['start', 'center', 'end']).default('start'),
  lineHeight: z.number().positive().default(1.4),
  /** Espacement des lettres en em ; toujours forcé à 0 pour l'arabe. */
  letterSpacing: z.number().min(-0.2).max(1).default(0),
  /** Majuscules : jamais appliquées à l'arabe. */
  textTransform: z.enum(['none', 'uppercase']).default('none'),
  effects: textEffectsSchema.prefault({}),
});
export type TextStyle = z.infer<typeof textStyleSchema>;

export const textRunStyleSchema = z.object({
  color: colorSchema.optional(),
  fontWeight: weightSchema.optional(),
  italic: z.boolean().optional(),
  /** Couleur de surlignage (effet marqueur) de ce segment. */
  highlight: colorSchema.optional(),
});
export type TextRunStyle = z.infer<typeof textRunStyleSchema>;

/** Segment : texte stylé, ou formule LaTeX en ligne (toujours isolée de gauche à droite). */
export const textRunSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    text: z.string(),
    style: textRunStyleSchema.optional(),
  }),
  z.object({
    kind: z.literal('math'),
    latex: z.string(),
    style: z.object({ color: colorSchema.optional() }).optional(),
  }),
]);
export type TextRun = z.infer<typeof textRunSchema>;
