import { interpolate } from 'remotion';

/**
 * Opacité d'un fondu d'apparition (fonction pure, dépend uniquement de la frame).
 * 0 avant `start`, 1 à partir de `start + duration`, progression linéaire entre les deux.
 */
export const fadeInOpacity = (frame: number, start: number, duration: number): number => {
  if (duration <= 0) {
    return frame >= start ? 1 : 0;
  }
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
