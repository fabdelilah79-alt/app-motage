import type { FC } from 'react';
import type { ShapeElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { shapePath } from '../media/shapePaths';

const OPEN_SHAPES: readonly ShapeElement['shape'][] = ['line', 'arrow', 'curvedArrow'];

/** Forme vectorielle : rectangle, cercle, polygone, étoile, ligne, flèches, bulle. */
export const ShapeElementView: FC<{ element: ShapeElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const { width, height } = element.transform;
  const { d, transform } = shapePath(
    element.shape,
    width,
    height,
    element.sides,
    element.strokeWidth / 2,
  );
  const open = OPEN_SHAPES.includes(element.shape);
  // Tracé : le contour se dessine (longueur normalisée à 1), puis le remplissage apparaît.
  const draw = animation.draw;
  const dash = draw
    ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw.stroke }
    : {};

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path
        d={d}
        transform={transform}
        fill={open ? 'none' : animatedColor(element.fill, animation)}
        fillOpacity={draw ? draw.fill : 1}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...dash}
      />
    </svg>
  );
};
