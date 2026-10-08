import { z } from 'zod';
import { frameCountSchema, langSchema, positiveFrameCountSchema } from './common';
import { elementBaseShape } from './elementBase';
import { textRunSchema } from './text';

/** Étape de calcul : à la frame `at`, l'équation se transforme en `latex`. */
export const mathStepSchema = z.object({
  latex: z.string(),
  at: frameCountSchema,
  duration: positiveFrameCountSchema.default(24),
});
export type MathStep = z.infer<typeof mathStepSchema>;

/** Équation LaTeX (MathJax SVG), toujours écrite de gauche à droite. */
export const mathElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('math'),
  latex: z.string().default('E_c = \\frac{1}{2} m v^2'),
  color: z.string().default('theme.text'),
  fontSize: z.number().positive().default(80),
  align: z.enum(['start', 'center', 'end']).default('center'),
  steps: z.array(mathStepSchema).default([]),
});
export type MathElement = z.infer<typeof mathElementSchema>;

/** Vecteur : point d'application, direction, norme proportionnelle, composantes, angle. */
export const vectorElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('vector'),
  /** Point d'application, en proportion de la boîte de l'élément (0 à 1). */
  originX: z.number().min(0).max(1).default(0.2),
  originY: z.number().min(0).max(1).default(0.7),
  /** Angle en degrés, sens trigonométrique depuis l'horizontale. */
  angle: z.number().default(30),
  value: z.number().min(0).default(10),
  unit: z.string().default('N'),
  /** Longueur en pixels pour une unité (norme proportionnelle). */
  pxPerUnit: z.number().positive().default(30),
  /** Nom en LaTeX, ex. \vec{F}. */
  label: z.string().default('\\vec{F}'),
  showValue: z.boolean().default(false),
  showComponents: z.boolean().default(false),
  showAngle: z.boolean().default(false),
  color: z.string().default('theme.accent1'),
  componentColor: z.string().default('theme.muted'),
  strokeWidth: z.number().min(1).max(20).default(6),
});
export type VectorElement = z.infer<typeof vectorElementSchema>;

/** Cotation : double flèche sur la largeur de la boîte avec sa valeur (ex. « L = 2 m »). */
export const dimensionElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('dimension'),
  label: z.string().default('L = 2 m'),
  lang: langSchema.default('fr'),
  color: z.string().default('theme.text'),
  strokeWidth: z.number().min(1).max(12).default(3),
  fontSize: z.number().positive().default(36),
});
export type DimensionElement = z.infer<typeof dimensionElementSchema>;

/** Schéma paramétrable de la bibliothèque (mécanique, électricité, optique, divers). */
export const diagramElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('diagram'),
  diagramId: z.string().min(1),
  params: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).default({}),
  label: z.string().default(''),
  color: z.string().default('theme.text'),
  accent: z.string().default('theme.accent1'),
  fill: z.string().default('theme.surface'),
  strokeWidth: z.number().min(1).max(12).default(3),
});
export type DiagramElement = z.infer<typeof diagramElementSchema>;

export const calloutKindSchema = z.enum(['definition', 'remember', 'warning', 'example', 'method']);
export type CalloutKind = z.infer<typeof calloutKindSchema>;

/** Encadré pédagogique : Définition, À retenir, Attention, Exemple, Méthode. */
export const calloutElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('callout'),
  calloutKind: calloutKindSchema.default('definition'),
  lang: langSchema,
  /** Titre personnalisé (vide : titre du type d'encadré dans la langue du texte). */
  title: z.string().default(''),
  content: z.array(textRunSchema).min(1),
  fontSize: z.number().positive().default(40),
});
export type CalloutElement = z.infer<typeof calloutElementSchema>;
