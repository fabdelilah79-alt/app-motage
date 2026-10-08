import type { VectorElement } from '../../shared/schema';

export type VectorGeometry = {
  origin: { x: number; y: number };
  tip: { x: number; y: number };
  length: number;
  /** Angle en radians (sens trigonométrique, l'axe y de l'écran est vers le bas). */
  radians: number;
};

/** Point d'application, extrémité et longueur (norme × échelle) d'un vecteur. */
export const vectorGeometry = (
  element: Pick<VectorElement, 'originX' | 'originY' | 'angle' | 'value' | 'pxPerUnit'>,
  width: number,
  height: number,
): VectorGeometry => {
  const origin = { x: element.originX * width, y: element.originY * height };
  const length = element.value * element.pxPerUnit;
  const radians = (element.angle * Math.PI) / 180;
  return {
    origin,
    tip: { x: origin.x + length * Math.cos(radians), y: origin.y - length * Math.sin(radians) },
    length,
    radians,
  };
};

/** Pointe de flèche (triangle) au bout d'un segment. */
export const arrowHead = (
  from: { x: number; y: number },
  to: { x: number; y: number },
  size: number,
): string => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const back = (offset: number) =>
    `${to.x - size * Math.cos(angle + offset)} ${to.y - size * Math.sin(angle + offset)}`;
  return `M${to.x} ${to.y} L${back(0.45)} L${back(-0.45)} Z`;
};

/** Nom du vecteur en LaTeX, suivi de sa valeur si demandé (ex. \vec{F} = 10\,\text{N}). */
export const vectorLabel = (element: Pick<VectorElement, 'label' | 'showValue' | 'value' | 'unit'>) =>
  element.showValue
    ? `${element.label} = ${element.value}${element.unit ? `\\,\\text{${element.unit}}` : ''}`
    : element.label;
