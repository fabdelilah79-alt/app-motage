import { interpolate } from 'remotion';
import type { AnimatableNumber } from '../../../shared/schema';
import { canonicalName } from '../../../shared/science/expression';
import { EASINGS } from '../../animations/easings';

/** Valeur d'un nombre animable à une frame (relative au début de l'élément). */
export const numberAt = (number: AnimatableNumber, frame: number): number => {
  if (number.to === undefined) return number.value;
  const progress = interpolate(frame, [number.start, number.start + number.duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return number.value + (number.to - number.value) * EASINGS[number.easing](progress);
};

/** Variables d'une courbe à une frame (« omega » et « ω » désignent la même variable). */
export const scopeAt = (
  params: Readonly<Record<string, AnimatableNumber>>,
  frame: number,
): Record<string, number> => {
  const scope: Record<string, number> = {};
  for (const [name, number] of Object.entries(params)) {
    scope[canonicalName(name.trim())] = numberAt(number, frame);
  }
  return scope;
};

/** Progression 0 → 1 d'une animation qui commence à `start` et dure `duration` frames. */
export const progressAt = (frame: number, start: number, duration: number): number =>
  duration <= 0
    ? frame >= start
      ? 1
      : 0
    : interpolate(frame, [start, start + duration], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
