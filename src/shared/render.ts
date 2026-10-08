import { z } from 'zod';

export const renderStatusSchema = z.enum(['bundling', 'rendering', 'done', 'error', 'cancelled']);
export type RenderStatus = z.infer<typeof renderStatusSchema>;

/** État d'un export vidéo, partagé entre le serveur et l'éditeur. */
export const renderJobStateSchema = z.object({
  id: z.string(),
  status: renderStatusSchema,
  /** Progression de 0 à 1 (arrondie au centième). */
  progress: z.number().min(0).max(1),
  outputPath: z.string(),
  error: z.string().nullable(),
  /** Début du rendu des images (ms) : sert à estimer le temps restant. */
  startedAt: z.number().nullable().default(null),
});
export type RenderJobState = z.infer<typeof renderJobStateSchema>;

export const isRenderFinished = (status: RenderStatus): boolean =>
  status === 'done' || status === 'error' || status === 'cancelled';

/** Temps restant estimé (secondes) d'après la progression et le temps déjà écoulé. */
export const estimateRemainingSeconds = (
  progress: number,
  startedAt: number | null,
  now: number,
): number | null => {
  if (startedAt === null || progress <= 0.02 || progress >= 1) return null;
  const elapsed = (now - startedAt) / 1000;
  return Math.max(0, Math.round((elapsed * (1 - progress)) / progress));
};
