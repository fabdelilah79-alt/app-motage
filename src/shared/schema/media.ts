import { z } from 'zod';
import { frameCountSchema, idSchema } from './common';

/** Cadre d'un média visuel : ajustement, masque, coins arrondis, bordure, ombre. */
export const mediaFrameShape = {
  fit: z.enum(['cover', 'contain']).default('contain'),
  mask: z.enum(['none', 'rounded', 'circle']).default('none'),
  /** Rayon des coins (pixels) pour le masque « rounded ». */
  cornerRadius: z.number().min(0).default(32),
  border: z.object({ width: z.number().min(0), color: z.string() }).optional(),
  shadow: z.boolean().default(false),
};

/** Recadrage en pourcentage de l'image d'origine, depuis chaque bord. */
export const cropSchema = z.object({
  top: z.number().min(0).max(90).default(0),
  right: z.number().min(0).max(90).default(0),
  bottom: z.number().min(0).max(90).default(0),
  left: z.number().min(0).max(90).default(0),
});
export type Crop = z.infer<typeof cropSchema>;

/** Effet Ken Burns : zoom lent (1 = désactivé) et déplacement (-1 à 1) pendant l'élément. */
export const kenBurnsSchema = z.object({
  zoom: z.number().min(1).max(2).default(1),
  panX: z.number().min(-1).max(1).default(0),
  panY: z.number().min(-1).max(1).default(0),
});
export type KenBurns = z.infer<typeof kenBurnsSchema>;

/** Effets sonores intégrés (public/sfx), associables à l'apparition d'un élément. */
export const sfxIdSchema = z.enum(['whoosh', 'pop', 'click', 'ding']);
export type SfxId = z.infer<typeof sfxIdSchema>;
export const SFX_IDS: readonly SfxId[] = sfxIdSchema.options;

export const elementSoundSchema = z.object({
  sfx: sfxIdSchema,
  volume: z.number().min(0).max(1).default(0.8),
});

/** Voix off d'une scène (enregistrée dans l'application ou importée). */
export const voiceoverSchema = z.object({
  assetId: idSchema,
  volume: z.number().min(0).max(1).default(1),
  /** Début de la voix, en frames après le début de la scène. */
  offset: frameCountSchema.default(0),
});
export type Voiceover = z.infer<typeof voiceoverSchema>;

/** Musique de fond, au niveau du projet, atténuée automatiquement pendant les voix off. */
export const audioTrackSchema = z.object({
  id: idSchema,
  assetId: idSchema,
  volume: z.number().min(0).max(1).default(0.4),
  fadeIn: frameCountSchema.default(30),
  fadeOut: frameCountSchema.default(45),
  loop: z.boolean().default(true),
  ducking: z
    .object({
      enabled: z.boolean().default(true),
      /** Volume relatif de la musique pendant la voix (0,35 = 35 %). */
      level: z.number().min(0).max(1).default(0.35),
    })
    .prefault({}),
});
export type AudioTrack = z.infer<typeof audioTrackSchema>;
