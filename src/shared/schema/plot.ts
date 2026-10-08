import { z } from 'zod';
import { easingIdSchema } from './animation';
import { frameCountSchema, idSchema, positiveFrameCountSchema } from './common';
import { elementBaseShape } from './elementBase';

/**
 * Nombre qui peut varier dans le temps (ex. ω augmente → la courbe se déforme).
 * Sans `to`, la valeur reste fixe. Frames relatives au début de l'élément.
 */
export const animatableNumberSchema = z.object({
  value: z.number(),
  to: z.number().optional(),
  start: frameCountSchema.default(0),
  duration: positiveFrameCountSchema.default(60),
  easing: easingIdSchema.default('smooth'),
});
export type AnimatableNumber = z.infer<typeof animatableNumberSchema>;

export const axes2DSchema = z.object({
  xMin: z.number().default(-1),
  xMax: z.number().default(10),
  yMin: z.number().default(-1),
  yMax: z.number().default(10),
  /** Écart entre deux graduations (0 = automatique). */
  xStep: z.number().min(0).default(0),
  yStep: z.number().min(0).default(0),
  grid: z.boolean().default(true),
  arrows: z.boolean().default(true),
  showNumbers: z.boolean().default(true),
  /** Noms des axes avec unités, ex. « v (m/s) ». */
  xLabel: z.string().default('x'),
  yLabel: z.string().default('y'),
  color: z.string().default('theme.text'),
  gridColor: z.string().default('theme.grid'),
  fontSize: z.number().positive().default(28),
});
export type Axes2D = z.infer<typeof axes2DSchema>;

const seriesBase = {
  id: idSchema,
  color: z.string().default('theme.accent1'),
  width: z.number().min(0.5).max(20).default(5),
  dashed: z.boolean().default(false),
  /** Nom affiché au bout de la courbe (facultatif). */
  label: z.string().default(''),
  /** Tracé progressif : début et durée en frames (durée 0 = courbe affichée d'un coup). */
  drawStart: frameCountSchema.default(0),
  drawDuration: frameCountSchema.default(45),
  params: z.record(z.string(), animatableNumberSchema).default({}),
};

export const FIT_KINDS = ['none', 'linear', 'affine', 'quadratic', 'exponential'] as const;
export const fitKindSchema = z.enum(FIT_KINDS);
export type FitKind = z.infer<typeof fitKindSchema>;

export const series2DSchema = z.discriminatedUnion('kind', [
  z.object({ ...seriesBase, kind: z.literal('function'), expr: z.string() }),
  z.object({
    ...seriesBase,
    kind: z.literal('parametric'),
    x: z.string(),
    y: z.string(),
    tMin: z.number().default(0),
    tMax: z.number().default(2 * Math.PI),
  }),
  z.object({
    ...seriesBase,
    kind: z.literal('polar'),
    r: z.string(),
    thetaMin: z.number().default(0),
    thetaMax: z.number().default(2 * Math.PI),
  }),
  z.object({
    ...seriesBase,
    kind: z.literal('data'),
    points: z.array(z.tuple([z.number(), z.number()])).default([]),
    fit: fitKindSchema.default('none'),
    showEquation: z.boolean().default(true),
    marker: z.enum(['circle', 'square', 'cross']).default('circle'),
  }),
]);
export type Series2D = z.infer<typeof series2DSchema>;
export type SeriesKind = Series2D['kind'];

const decorationBase = { id: idSchema, color: z.string().default('theme.accent2') };

/** Décorations d'un repère : point mobile (et tangente), aire, asymptote, point, note. */
export const plotDecorationSchema = z.discriminatedUnion('kind', [
  z.object({
    ...decorationBase,
    kind: z.literal('movingPoint'),
    seriesId: idSchema,
    /** Abscisse (ou paramètre t / θ) de départ et d'arrivée. */
    from: z.number(),
    to: z.number(),
    start: frameCountSchema.default(30),
    duration: positiveFrameCountSchema.default(90),
    easing: easingIdSchema.default('linear'),
    showCoords: z.boolean().default(true),
    guides: z.boolean().default(true),
    tangent: z.boolean().default(false),
  }),
  z.object({
    ...decorationBase,
    kind: z.literal('area'),
    seriesId: idSchema,
    from: z.number(),
    to: z.number(),
    start: frameCountSchema.default(30),
    duration: positiveFrameCountSchema.default(60),
    opacity: z.number().min(0).max(1).default(0.35),
  }),
  z.object({
    ...decorationBase,
    kind: z.literal('asymptote'),
    orientation: z.enum(['vertical', 'horizontal']).default('horizontal'),
    value: z.number(),
    label: z.string().default(''),
  }),
  z.object({
    ...decorationBase,
    kind: z.literal('point'),
    x: z.number(),
    y: z.number(),
    label: z.string().default(''),
    guides: z.boolean().default(true),
  }),
  z.object({
    ...decorationBase,
    kind: z.literal('annotation'),
    x: z.number(),
    y: z.number(),
    text: z.string(),
  }),
]);
export type PlotDecoration = z.infer<typeof plotDecorationSchema>;
export type PlotDecorationKind = PlotDecoration['kind'];

/** Repère 2D avec ses courbes et décorations. */
export const plot2dElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('plot2d'),
  axes: axes2DSchema.prefault({}),
  series: z.array(series2DSchema).default([]),
  decorations: z.array(plotDecorationSchema).default([]),
});
export type Plot2DElement = z.infer<typeof plot2dElementSchema>;

export const chartKindSchema = z.enum(['bar', 'pie', 'histogram']);
export type ChartKind = z.infer<typeof chartKindSchema>;

/** Graphique de données animé : barres, secteurs ou histogramme. */
export const chartElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('chart'),
  chartKind: chartKindSchema.default('bar'),
  items: z
    .array(z.object({ label: z.string(), value: z.number(), color: z.string().optional() }))
    .default([]),
  /** Histogramme : valeurs brutes regroupées en classes. */
  values: z.array(z.number()).default([]),
  bins: z.number().int().min(1).max(40).default(6),
  showValues: z.boolean().default(true),
  unit: z.string().default(''),
  textColor: z.string().default('theme.text'),
  /** Durée de croissance des barres / secteurs, puis décalage entre deux barres. */
  growDuration: positiveFrameCountSchema.default(40),
  stagger: frameCountSchema.default(6),
  fontSize: z.number().positive().default(28),
});
export type ChartElement = z.infer<typeof chartElementSchema>;
