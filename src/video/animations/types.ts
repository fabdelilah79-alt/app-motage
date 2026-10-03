import type { z } from 'zod';
import type { ElementType, Lang } from '../../shared/schema';

/** Révélation progressive d'un texte (machine à écrire, mot par mot, rideau…). */
export type RevealMode = 'typewriter' | 'word' | 'line' | 'letter' | 'mask';
export type TextReveal = { mode: RevealMode; progress: number };

/** État visuel produit par une animation à un instant donné (valeurs neutres = aucun effet). */
export type AnimationFrame = {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  /** Uniquement pour les textes : partie du texte déjà révélée. */
  reveal?: TextReveal;
};

export const NEUTRAL_FRAME: AnimationFrame = { opacity: 1, translateX: 0, translateY: 0, scale: 1 };

export type AnimationCategory = 'enter' | 'emphasis' | 'exit';

type PresetMetadata = {
  /** Identifiant stocké dans le projet, ex. « enter.fade ». */
  id: string;
  name: Record<Lang, string>;
  category: AnimationCategory;
  /** Durée par défaut en frames (à 30 i/s). */
  defaultDuration: number;
  compatibleElements: 'all' | readonly ElementType[];
  /** false si l'animation découpe le texte d'une façon qui casse les liaisons arabes. */
  arabicCompatible: boolean;
};

/** Définition d'un préréglage : une fonction pure de la progression (0 → 1) et des paramètres. */
export type PresetDefinition<Schema extends z.ZodType> = PresetMetadata & {
  paramsSchema: Schema;
  apply: (progress: number, params: z.output<Schema>) => AnimationFrame;
};

/** Préréglage enregistré : les paramètres bruts du projet sont validés avant l'application. */
export type AnimationPreset = PresetMetadata & {
  paramsSchema: z.ZodType;
  run: (progress: number, rawParams: unknown) => AnimationFrame;
};
