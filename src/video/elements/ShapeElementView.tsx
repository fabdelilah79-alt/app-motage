import { useMemo, type FC } from 'react';
import type { ShapeElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { shapePath } from '../media/shapePaths';
import { useTheme } from '../themes/ThemeContext';
import { seedFromId, sketchPaths } from '../themes/sketch';

const OPEN_SHAPES: readonly ShapeElement['shape'][] = ['line', 'arrow', 'curvedArrow'];

/** Ombre douce du thème « papier découpé ». */
const PAPER_SHADOW = 'drop-shadow(0 6px 6px rgba(0, 0, 0, 0.25))';

/**
 * Forme vectorielle : rectangle, cercle, polygone, étoile, ligne, flèches, bulle.
 * Thèmes « tableau noir » et « cahier » : tracé dessiné à la main (Rough.js, graine fixe).
 */
export const ShapeElementView: FC<{ element: ShapeElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const theme = useTheme();
  const { width, height } = element.transform;
  const { d, transform } = shapePath(
    element.shape,
    width,
    height,
    element.sides,
    element.strokeWidth / 2,
  );
  const open = OPEN_SHAPES.includes(element.shape);
  const fill = open ? 'none' : animatedColor(element.fill, animation);
  // Tracé : le contour se dessine (longueur normalisée à 1), puis le remplissage apparaît.
  const draw = animation.draw;
  const dash = draw
    ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - draw.stroke }
    : {};
  const sketch = theme.strokeStyle === 'sketch';
  const sketched = useMemo(
    () =>
      sketch
        ? sketchPaths(d, {
            stroke: element.stroke,
            strokeWidth: element.strokeWidth,
            fill,
            seed: seedFromId(element.id),
          })
        : [],
    [sketch, d, element.stroke, element.strokeWidth, fill, element.id],
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: 'block',
        overflow: 'visible',
        filter: theme.shapeShadow ? PAPER_SHADOW : undefined,
      }}
    >
      {sketch ? (
        <g transform={transform}>
          {sketched.map((path, index) => (
            <path
              key={index}
              d={path.d}
              fill={path.fill}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={draw && path.role === 'fill' ? draw.fill : 1}
              {...(path.role === 'stroke' ? dash : {})}
            />
          ))}
        </g>
      ) : (
        <path
          d={d}
          transform={transform}
          fill={fill}
          fillOpacity={draw ? draw.fill : 1}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...dash}
        />
      )}
    </svg>
  );
};
