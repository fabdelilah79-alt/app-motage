import { interpolate } from 'remotion';
import type { AnimationRef, ElementAnimations } from '../../shared/schema';
import { EASINGS } from './easings';
import { getAnimationPreset } from './registry';
import { NEUTRAL_FRAME, type AnimationFrame } from './types';

/** Progression (0 → 1, accélération appliquée) d'une animation commençant à `start`. */
const progressAt = (frame: number, start: number, ref: AnimationRef): number =>
  interpolate(frame, [start, start + ref.duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASINGS[ref.easing],
  });

const runAnimation = (ref: AnimationRef, progress: number): AnimationFrame => {
  const preset = getAnimationPreset(ref.presetId);
  return preset ? preset.run(progress, ref.params) : NEUTRAL_FRAME;
};

const combine = (a: AnimationFrame, b: AnimationFrame): AnimationFrame => ({
  opacity: a.opacity * b.opacity,
  translateX: a.translateX + b.translateX,
  translateY: a.translateY + b.translateY,
  scale: a.scale * b.scale,
  reveal: b.reveal ?? a.reveal,
});

/**
 * État visuel d'un élément à la frame `frame` (relative au début de l'élément).
 * L'apparition commence après `delay` ; la disparition se termine `delay` frames avant la fin.
 */
export const computeElementAnimation = (
  animations: ElementAnimations,
  elementDuration: number,
  frame: number,
): AnimationFrame => {
  let result = NEUTRAL_FRAME;
  const { enter, exit } = animations;
  if (enter) {
    result = combine(result, runAnimation(enter, progressAt(frame, enter.delay, enter)));
  }
  if (exit) {
    const start = elementDuration - exit.delay - exit.duration;
    result = combine(result, runAnimation(exit, progressAt(frame, start, exit)));
  }
  return result;
};
