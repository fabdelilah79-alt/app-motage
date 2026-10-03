import type { Timing } from '../../shared/schema';

export type TimingDragMode = 'move' | 'start' | 'end';

/**
 * Nouveau minutage d'un élément après un glissement de `delta` frames sur la timeline :
 * déplacer la barre, ou tirer son bord gauche (début) ou droit (fin).
 * L'élément reste dans la scène et dure au moins une frame.
 */
export const dragTiming = (
  mode: TimingDragMode,
  initial: Timing,
  delta: number,
  sceneDuration: number,
): Timing => {
  const end = initial.from + initial.duration;
  switch (mode) {
    case 'move': {
      const duration = Math.min(initial.duration, sceneDuration);
      const from = Math.max(0, Math.min(initial.from + delta, sceneDuration - duration));
      return { from, duration };
    }
    case 'start': {
      const from = Math.max(0, Math.min(initial.from + delta, end - 1));
      return { from, duration: end - from };
    }
    case 'end': {
      const maxDuration = sceneDuration - initial.from;
      const duration = Math.max(1, Math.min(initial.duration + delta, maxDuration));
      return { from: initial.from, duration };
    }
  }
};
