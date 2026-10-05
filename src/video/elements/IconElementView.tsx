import type { FC } from 'react';
import type { IconElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { ICON_CATALOG } from '../media/iconCatalog';

/** Longueur de tiret supérieure aux traits des icônes (dessinées dans un carré de 24). */
const DASH = 80;

/** Icône vectorielle de la bibliothèque intégrée (tracé possible avec « Tracé »). */
export const IconElementView: FC<{ element: IconElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const Icon = ICON_CATALOG[element.iconId];
  if (!Icon) {
    return null;
  }
  const draw = animation.draw;
  return (
    <Icon
      width="100%"
      height="100%"
      color={animatedColor(element.color, animation)}
      strokeWidth={element.strokeWidth}
      style={{
        display: 'block',
        strokeDasharray: draw ? DASH : undefined,
        strokeDashoffset: draw ? DASH * (1 - draw.stroke) : undefined,
      }}
    />
  );
};
