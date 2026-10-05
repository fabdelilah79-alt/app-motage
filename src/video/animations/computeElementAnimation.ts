import type { AnimationRef, ElementAnimations } from '../../shared/schema';
import { EASINGS } from './easings';
import { NEUTRAL_FRAME, combineFrames } from './frame';
import { getAnimationPreset } from './registry';
import type { AnimationFrame } from './types';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Progression (0 → 1, accélération appliquée) d'une animation commençant à `start`. */
const progressAt = (frame: number, start: number, ref: AnimationRef): number =>
  EASINGS[ref.easing](clamp01((frame - start) / ref.duration));

const runAnimation = (ref: AnimationRef, progress: number): AnimationFrame => {
  const preset = getAnimationPreset(ref.presetId);
  return preset ? preset.run(progress, ref.params) : NEUTRAL_FRAME;
};

/**
 * Mise en valeur ou mouvement : joué `repeat` fois à partir de `delay`.
 * Avant : aucun effet. Après : aucun effet, sauf pour les préréglages qui gardent
 * leur état final (décorations tracées, déplacement A → B, changement de couleur).
 */
const emphasisFrame = (ref: AnimationRef, frame: number): AnimationFrame => {
  const local = frame - ref.delay;
  const total = ref.duration * ref.repeat;
  if (local < 0) return NEUTRAL_FRAME;
  if (local >= total) {
    return getAnimationPreset(ref.presetId)?.holdAfter ? runAnimation(ref, 1) : NEUTRAL_FRAME;
  }
  const withinRepeat = (local % ref.duration) / ref.duration;
  return runAnimation(ref, EASINGS[ref.easing](withinRepeat));
};

/**
 * État visuel d'un élément à la frame `frame` (relative au début de l'élément) :
 * apparition, puis mises en valeur / mouvements, puis disparition.
 * L'apparition commence après `delay` ; la disparition se termine `delay` frames avant la fin.
 */
export const computeElementAnimation = (
  animations: ElementAnimations,
  elementDuration: number,
  frame: number,
): AnimationFrame => {
  let result = NEUTRAL_FRAME;
  const { enter, emphasis, exit } = animations;
  if (enter) {
    result = combineFrames(result, runAnimation(enter, progressAt(frame, enter.delay, enter)));
  }
  for (const ref of emphasis) {
    result = combineFrames(result, emphasisFrame(ref, frame));
  }
  if (exit) {
    const start = elementDuration - exit.delay - exit.duration;
    result = combineFrames(result, runAnimation(exit, progressAt(frame, start, exit)));
  }
  return result;
};
