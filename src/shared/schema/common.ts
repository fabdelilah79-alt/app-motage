import { z } from 'zod';

export const langSchema = z.enum(['fr', 'ar', 'en']);
export type Lang = z.infer<typeof langSchema>;

export const LANGS: readonly Lang[] = langSchema.options;

/** Identifiant non vide (scène, élément, média…). */
export const idSchema = z.string().min(1);

/** Nombre entier de frames (le temps est toujours stocké en frames). */
export const frameCountSchema = z.number().int().min(0);
export const positiveFrameCountSchema = z.number().int().positive();
