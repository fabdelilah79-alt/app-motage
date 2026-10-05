import type { CameraMove } from '../../shared/schema';
import { EASINGS } from '../animations/easings';

/** Cadrage : point visé (proportion de la scène, 0 à 1) et zoom (1 = plan large). */
export type CameraState = { centerX: number; centerY: number; zoom: number };

export const FULL_SHOT: CameraState = { centerX: 0.5, centerY: 0.5, zoom: 1 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cadrage visé par un mouvement, à partir du cadrage précédent. */
const targetOf = (move: CameraMove, previous: CameraState): CameraState => {
  switch (move.kind) {
    case 'reset':
      return FULL_SHOT;
    case 'pan':
      // Panoramique : on garde le zoom, on déplace le regard.
      return { centerX: move.centerX, centerY: move.centerY, zoom: previous.zoom };
    case 'zoom':
    case 'travelling':
      return { centerX: move.centerX, centerY: move.centerY, zoom: move.zoom };
  }
};

/** Cadrage à une frame de la scène : les mouvements s'enchaînent dans l'ordre de leur début. */
export const cameraAt = (moves: readonly CameraMove[], frame: number): CameraState => {
  let state = FULL_SHOT;
  for (const move of [...moves].sort((a, b) => a.from - b.from)) {
    if (frame <= move.from) break;
    const t = EASINGS[move.easing](Math.min(1, (frame - move.from) / move.duration));
    const target = targetOf(move, state);
    state = {
      centerX: lerp(state.centerX, target.centerX, t),
      centerY: lerp(state.centerY, target.centerY, t),
      zoom: lerp(state.zoom, target.zoom, t),
    };
  }
  return state;
};

/**
 * Transformation CSS (origine en haut à gauche) qui place le point visé au centre de l'image,
 * sans jamais montrer l'extérieur de la scène.
 */
export const cameraTransform = (state: CameraState, width: number, height: number) => {
  const zoom = Math.max(1, state.zoom);
  const half = 0.5 / zoom;
  const centerX = Math.min(1 - half, Math.max(half, state.centerX));
  const centerY = Math.min(1 - half, Math.max(half, state.centerY));
  const x = width / 2 - centerX * width * zoom;
  const y = height / 2 - centerY * height * zoom;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${zoom.toFixed(4)})`;
};
