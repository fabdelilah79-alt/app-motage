import type { FC } from 'react';
import type { ShapeElement } from '../../shared/schema';
import { shapePath } from '../media/shapePaths';

const OPEN_SHAPES: readonly ShapeElement['shape'][] = ['line', 'arrow', 'curvedArrow'];

/** Forme vectorielle : rectangle, cercle, polygone, étoile, ligne, flèches, bulle. */
export const ShapeElementView: FC<{ element: ShapeElement }> = ({ element }) => {
  const { width, height } = element.transform;
  const { d, transform } = shapePath(
    element.shape,
    width,
    height,
    element.sides,
    element.strokeWidth / 2,
  );
  const open = OPEN_SHAPES.includes(element.shape);

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
        fill={open ? 'none' : element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
