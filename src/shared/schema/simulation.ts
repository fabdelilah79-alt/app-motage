import { z } from 'zod';
import { frameCountSchema, idSchema } from './common';
import { elementBaseShape } from './elementBase';

/**
 * Simulation physique prête à l'emploi : modèle pré-calculé (src/shared/simulations),
 * paramètres avec unités, vecteurs, trajectoire, valeurs, graphique synchronisé.
 */
export const simulationElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal('simulation'),
  simId: idSchema,
  /** Valeurs des paramètres (unités du modèle) ; absentes = valeurs par défaut. */
  params: z.record(z.string(), z.number()).default({}),
  display: z
    .object({
      vectors: z.array(z.string()).default([]),
      trajectory: z.boolean().default(true),
      values: z.boolean().default(true),
      energyBars: z.boolean().default(false),
    })
    .prefault({}),
  /** Graphique synchronisé d'une grandeur (vide : pas de graphique). */
  graph: z
    .object({
      quantity: z.string().default(''),
      position: z.enum(['right', 'below']).default('right'),
    })
    .prefault({}),
  /** Ralenti (< 1) ou accéléré (> 1) : secondes simulées par seconde de vidéo. */
  playbackRate: z.number().min(0.05).max(20).default(1),
  /** Pause sur un instant : la simulation s'arrête à cette frame (relative à l'élément). */
  freezeAt: frameCountSchema.optional(),
  color: z.string().default('theme.accent1'),
  accent: z.string().default('theme.accent2'),
  textColor: z.string().default('theme.text'),
  fontSize: z.number().positive().default(28),
});
export type SimulationElement = z.infer<typeof simulationElementSchema>;
