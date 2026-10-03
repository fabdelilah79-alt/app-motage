import { z } from 'zod';
import { idSchema, langSchema } from './common';
import { sceneSchema } from './scene';

export const CURRENT_SCHEMA_VERSION = 1;

export const formatSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.union([z.literal(30), z.literal(60)]),
});
export type ProjectFormat = z.infer<typeof formatSchema>;

export const assetSchema = z.object({
  id: idSchema,
  kind: z.enum(['image']),
  name: z.string().default(''),
  /** Chemin relatif au dossier public (ex. « demo/chute-libre.svg ») ou URL complète. */
  src: z.string().min(1),
});
export type Asset = z.infer<typeof assetSchema>;

export const projectSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id: idSchema,
  title: z.string(),
  format: formatSchema,
  defaultLang: langSchema,
  assets: z.array(assetSchema).default([]),
  scenes: z.array(sceneSchema).min(1),
});
export type Project = z.infer<typeof projectSchema>;
/** Forme acceptée en entrée (valeurs par défaut facultatives). */
export type ProjectInput = z.input<typeof projectSchema>;
