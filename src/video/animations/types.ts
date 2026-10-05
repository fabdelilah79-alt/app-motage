import type { z } from 'zod';
import type { ElementType, Lang } from '../../shared/schema';

/** Révélation progressive d'un texte (machine à écrire, mot par mot, rideau…). */
export type RevealMode = 'typewriter' | 'word' | 'line' | 'letter' | 'mask';
export type TextReveal = { mode: RevealMode; progress: number };

/** Masque rectangulaire : pourcentage caché depuis chaque bord. */
export type ClipInsets = { top: number; right: number; bottom: number; left: number };

/** Décoration dessinée autour d'un élément (mises en valeur). */
export type DecorationKind = 'highlight' | 'underline' | 'circle' | 'arrow';
export type Decoration = { kind: DecorationKind; progress: number; color: string };

/**
 * État visuel produit par les animations à un instant donné.
 * Les valeurs de NEUTRAL_FRAME n'ont aucun effet ; les champs facultatifs sont des effets
 * particuliers que seuls certains éléments savent afficher.
 */
export type AnimationFrame = {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  /** Rotations en degrés (rotateX / rotateY : retournement 3D). */
  rotate: number;
  rotateX: number;
  rotateY: number;
  /** Flou en pixels. */
  blur: number;
  clip?: ClipInsets;
  glow?: { radius: number; color: string };
  /** Intensité du « glitch » (0 à 1). */
  glitch?: number;
  /** Uniquement pour les textes : partie du texte déjà révélée. */
  reveal?: TextReveal;
  /** Formes et icônes : tracé du contour puis remplissage (0 à 1). */
  draw?: { stroke: number; fill: number };
  /** Changement de couleur progressif (0 = couleur d'origine). */
  colorShift?: { color: string; amount: number };
  /** Couleur imposée par les images clés du mode Avancé. */
  colorOverride?: string;
  decoration?: Decoration;
  /** Textes : les nombres défilent de 0 jusqu'à leur valeur (0 à 1). */
  counter?: number;
};

export type AnimationCategory = 'enter' | 'emphasis' | 'exit' | 'motion';

/** Description d'un paramètre réglable dans l'interface (libellés traduits par l'éditeur). */
export type ParamField =
  | { key: string; kind: 'select'; options: readonly string[] }
  | { key: string; kind: 'number'; min: number; max: number; step: number }
  | { key: string; kind: 'color' };

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
  /** Paramètres proposés dans l'interface. */
  paramFields?: readonly ParamField[];
  /** Mise en valeur / mouvement : l'état final est conservé après l'animation. */
  holdAfter?: boolean;
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
