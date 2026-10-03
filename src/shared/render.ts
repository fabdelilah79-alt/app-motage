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
});
export type RenderJobState = z.infer<typeof renderJobStateSchema>;

export const isRenderFinished = (status: RenderStatus): boolean =>
  status === 'done' || status === 'error' || status === 'cancelled';
