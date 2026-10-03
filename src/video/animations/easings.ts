import { Easing } from 'remotion';
import type { EasingId } from '../../shared/schema';

/** Correspondance entre les noms simples d'accélération et les courbes Remotion. */
export const EASINGS: Record<EasingId, (t: number) => number> = {
  smooth: Easing.bezier(0.33, 1, 0.68, 1),
  snappy: Easing.bezier(0.16, 1, 0.3, 1),
  linear: Easing.linear,
};
