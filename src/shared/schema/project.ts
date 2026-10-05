import { z } from 'zod';
import { idSchema, langSchema } from './common';
import { audioTrackSchema } from './media';
import { sceneSchema } from './scene';

export const CURRENT_SCHEMA_VERSION = 1;

export const formatSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.union([z.literal(30), z.literal(60)]),
});
export type ProjectFormat = z.infer<typeof formatSchema>;

export const assetKindSchema = z.enum(['image', 'gif', 'video', 'audio', 'lottie']);
export type AssetKind = z.infer<typeof assetKindSchema>;

export const assetSchema = z.object({
  id: idSchema,
  kind: assetKindSchema,
  name: z.string().default(''),
  /**
   * « public » : fichier livré avec l'application (dossier public/, ex. « demo/chute-libre.svg »).
   * « project » : fichier importé, rangé dans le dossier du projet (ex. « assets/photo.png »).
   */
  storage: z.enum(['public', 'project']).default('public'),
  /** Chemin relatif (selon `storage`) ou URL complète. */
  src: z.string().min(1),
  /** Informations mesurées à l'import (durée des sons et vidéos, dimensions). */
  meta: z
    .object({
      durationInSeconds: z.number().positive().optional(),
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
    })
    .prefault({}),
});
export type Asset = z.infer<typeof assetSchema>;

export const brandSchema = z.object({
  logoAssetId: idSchema.optional(),
  logoCorner: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right']).default('top-right'),
  /** Largeur du logo en proportion de la largeur de la vidéo. */
  logoSize: z.number().min(0.03).max(0.5).default(0.1),
  colors: z.array(z.string()).default([]),
});
export type Brand = z.infer<typeof brandSchema>;

export const projectSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id: idSchema,
  title: z.string(),
  format: formatSchema,
  defaultLang: langSchema,
  /** Chiffres des textes arabes : 0-9 (« latin ») ou ٠-٩ (« arabic-indic »). */
  digits: z.enum(['latin', 'arabic-indic']).default('latin'),
  assets: z.array(assetSchema).default([]),
  /** Thème visuel (palette, polices, fond, style de trait) : src/video/themes. */
  themeId: z.string().default('minimal-light'),
  /** Couleurs du thème modifiées pour ce projet. */
  themeOverrides: z.record(z.string(), z.string()).default({}),
  /** Kit de marque : logo affiché sur toutes les scènes et couleurs personnelles. */
  brand: brandSchema.optional(),
  /** Musiques de fond (atténuées automatiquement sous les voix off). */
  audioTracks: z.array(audioTrackSchema).default([]),
  scenes: z.array(sceneSchema).min(1),
});
export type Project = z.infer<typeof projectSchema>;
/** Forme acceptée en entrée (valeurs par défaut facultatives). */
export type ProjectInput = z.input<typeof projectSchema>;
