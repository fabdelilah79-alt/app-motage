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
  /**
   * « public » : fichier livré avec l'application (dossier public/, ex. « demo/chute-libre.svg »).
   * « project » : fichier importé, rangé dans le dossier du projet (ex. « assets/photo.png »).
   */
  storage: z.enum(['public', 'project']).default('public'),
  /** Chemin relatif (selon `storage`) ou URL complète. */
  src: z.string().min(1),
});
export type Asset = z.infer<typeof assetSchema>;

export const projectSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id: idSchema,
  title: z.string(),
  format: formatSchema,
  defaultLang: langSchema,
  /** Chiffres des textes arabes : 0-9 (« latin ») ou ٠-٩ (« arabic-indic »). */
  digits: z.enum(['latin', 'arabic-indic']).default('latin'),
  assets: z.array(assetSchema).default([]),
  scenes: z.array(sceneSchema).min(1),
});
export type Project = z.infer<typeof projectSchema>;
/** Forme acceptée en entrée (valeurs par défaut facultatives). */
export type ProjectInput = z.input<typeof projectSchema>;
