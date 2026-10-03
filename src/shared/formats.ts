import { z } from 'zod';
import type { ProjectFormat } from './schema';

export const formatPresetIdSchema = z.enum(['landscape', 'portrait', 'square']);
export type FormatPresetId = z.infer<typeof formatPresetIdSchema>;

export const FORMAT_PRESET_IDS: readonly FormatPresetId[] = formatPresetIdSchema.options;

/** Formats proposés : 16:9 (YouTube), 9:16 (Shorts, Reels, Statuts), 1:1. */
export const FORMAT_PRESETS: Readonly<Record<FormatPresetId, ProjectFormat>> = {
  landscape: { width: 1920, height: 1080, fps: 30 },
  portrait: { width: 1080, height: 1920, fps: 30 },
  square: { width: 1080, height: 1080, fps: 30 },
};
