import { z } from 'zod';
import { frameCountSchema, idSchema, langSchema } from './common';
import { elementBaseShape } from './elementBase';
import { animatableNumberSchema } from './plot';

/** Point ou direction 3D (x, y, z) en unités du repère ; z est vertical. */
export const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);
export type Vec3 = z.infer<typeof vec3Schema>;

const fixed = (value: number) => animatableNumberSchema.prefault({ value });

/**
 * Caméra : angle autour de l'axe vertical (azimut), hauteur (élévation), distance.
 * Chaque valeur peut varier dans le temps (orbite, zoom) ; `orbitSpeed` ajoute une rotation
 * continue (degrés par seconde).
 */
export const camera3DSchema = z.object({
  azimuth: fixed(35),
  elevation: fixed(25),
  distance: fixed(16),
  orbitSpeed: z.number().default(0),
  fov: z.number().min(10).max(100).default(40),
});
export type Camera3D = z.infer<typeof camera3DSchema>;

export const axes3DSchema = z.object({
  show: z.boolean().default(true),
  /** Demi-longueur des axes. */
  size: z.number().positive().default(5),
  grid: z.boolean().default(true),
  labels: z.boolean().default(true),
  xLabel: z.string().default('x'),
  yLabel: z.string().default('y'),
  zLabel: z.string().default('z'),
});
export type Axes3D = z.infer<typeof axes3DSchema>;

export const material3DSchema = z.enum(['matte', 'glossy', 'wireframe', 'translucent']);
export type Material3D = z.infer<typeof material3DSchema>;

const objectBase = {
  id: idSchema,
  color: z.string().default('theme.accent1'),
  material: material3DSchema.default('matte'),
  /** Apparition (croissance ou tracé) : début et durée en frames, relatifs à l'élément. */
  start: frameCountSchema.default(0),
  duration: frameCountSchema.default(30),
  params: z.record(z.string(), animatableNumberSchema).default({}),
  label: z.string().default(''),
};

export const object3DSchema = z.discriminatedUnion('kind', [
  z.object({
    ...objectBase,
    kind: z.literal('surface'),
    expr: z.string(),
    xMin: z.number().default(-4),
    xMax: z.number().default(4),
    yMin: z.number().default(-4),
    yMax: z.number().default(4),
    resolution: z.number().int().min(4).max(120).default(48),
    /** Couleur selon la hauteur (dégradé) ou couleur unie. */
    heightColors: z.boolean().default(true),
  }),
  z.object({
    ...objectBase,
    kind: z.literal('curve'),
    x: z.string(),
    y: z.string(),
    z: z.string(),
    tMin: z.number().default(0),
    tMax: z.number().default(10),
    radius: z.number().positive().default(0.06),
    /** Particule au bout de la courbe pendant le tracé (trajectoire). */
    particle: z.boolean().default(true),
  }),
  z.object({
    ...objectBase,
    kind: z.literal('vectorField'),
    fx: z.string(),
    fy: z.string(),
    fz: z.string(),
    /** Nombre de flèches par axe et étendue (de −extent à +extent). */
    count: z.number().int().min(2).max(8).default(4),
    extent: z.number().positive().default(4),
    scale: z.number().positive().default(0.6),
  }),
  z.object({
    ...objectBase,
    kind: z.literal('solid'),
    shape: z.enum(['sphere', 'cube', 'cylinder', 'cone', 'plane']),
    position: vec3Schema.default([0, 0, 0]),
    size: z.number().positive().default(1),
    rotation: vec3Schema.default([0, 0, 0]),
  }),
  z.object({
    ...objectBase,
    kind: z.literal('arrow'),
    from: vec3Schema.default([0, 0, 0]),
    to: vec3Schema.default([0, 0, 3]),
    radius: z.number().positive().default(0.06),
  }),
  z.object({
    ...objectBase,
    kind: z.literal('label'),
    position: vec3Schema.default([0, 0, 0]),
    text: z.string(),
    lang: langSchema.default('fr'),
    fontSize: z.number().positive().default(36),
  }),
]);
export type Object3D = z.infer<typeof object3DSchema>;
export type Object3DKind = Object3D['kind'];

/** Scène 3D : repère, objets et caméra animée (rendu Three.js piloté par la frame). */
export const scene3dElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('scene3d'),
  camera: camera3DSchema.prefault({}),
  axes: axes3DSchema.prefault({}),
  objects: z.array(object3DSchema).default([]),
  /** Fond transparent (on voit le fond de la scène) ou couleur. */
  background: z.string().default('transparent'),
});
export type Scene3DElement = z.infer<typeof scene3dElementSchema>;
