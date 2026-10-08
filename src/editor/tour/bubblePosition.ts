export type Rect = { x: number; y: number; width: number; height: number };
type Size = { width: number; height: number };

const MARGIN = 12;

/**
 * Place la bulle à côté de la zone présentée (en dessous, sinon au-dessus, sinon à côté),
 * toujours entièrement visible dans la fenêtre.
 */
export const bubblePosition = (target: Rect | null, bubble: Size, viewport: Size) => {
  const clampX = (x: number) => Math.max(MARGIN, Math.min(viewport.width - bubble.width - MARGIN, x));
  const clampY = (y: number) => Math.max(MARGIN, Math.min(viewport.height - bubble.height - MARGIN, y));
  if (!target) {
    return { x: clampX((viewport.width - bubble.width) / 2), y: clampY((viewport.height - bubble.height) / 2) };
  }
  const centerX = target.x + target.width / 2 - bubble.width / 2;
  if (target.y + target.height + MARGIN + bubble.height <= viewport.height) {
    return { x: clampX(centerX), y: target.y + target.height + MARGIN };
  }
  if (target.y - MARGIN - bubble.height >= 0) {
    return { x: clampX(centerX), y: target.y - MARGIN - bubble.height };
  }
  // Grande zone (panneau latéral) : la bulle se place à l'intérieur, près du haut.
  const inside = target.x + target.width + MARGIN + bubble.width <= viewport.width
    ? target.x + target.width + MARGIN
    : target.x - MARGIN - bubble.width;
  return { x: clampX(inside), y: clampY(target.y + MARGIN) };
};
