import type { ElementAnimations } from '../../shared/schema';

/**
 * Instant (relatif à l'élément) montré dans la « vue de placement » de l'éditeur : juste
 * avant la disparition, quand l'élément est entièrement développé (courbe tracée, équation
 * finale, simulation avancée). Toujours dans la durée de l'élément.
 */
export const layoutFrame = (animations: ElementAnimations, duration: number): number => {
  const exit = animations.exit ? animations.exit.delay + animations.exit.duration : 0;
  return Math.max(0, Math.min(duration - 1, duration - 1 - exit));
};
