import { Easing } from 'remotion';
import type { EasingId } from '../../shared/schema';

/** Correspondance entre les noms simples d'accélération et les courbes Remotion. */
export const EASINGS: Record<EasingId, (t: number) => number> = {
  /** Douce : démarre vite, arrive en douceur. */
  smooth: Easing.bezier(0.33, 1, 0.68, 1),
  /** Vive : très rapide puis freinage marqué. */
  snappy: Easing.bezier(0.16, 1, 0.3, 1),
  /** Rebond : comme une balle qui rebondit en arrivant. */
  bounce: Easing.bounce,
  /** Élastique : dépasse légèrement puis oscille. */
  elastic: Easing.out(Easing.elastic(1)),
  /** Constante : vitesse uniforme. */
  linear: Easing.linear,
  /** Ralentie : démarre lentement puis accélère. */
  slow: Easing.bezier(0.7, 0, 0.84, 0),
};
