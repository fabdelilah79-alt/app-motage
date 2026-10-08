import type { FC } from 'react';
import type { DimensionElement } from '../../shared/schema';
import { animatedColor } from '../animations/frameStyles';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import { toArabicIndicDigits } from '../text/digits';
import { fontStackFor } from '../text/fontStack';
import { useTheme } from '../themes/ThemeContext';
import { arrowHead } from './vectorGeometry';

/** Cotation : traits de rappel, double flèche sur la largeur et valeur au-dessus. */
export const DimensionElementView: FC<{ element: DimensionElement; animation: AnimationFrame }> = ({
  element,
  animation,
}) => {
  const theme = useTheme();
  const { digits } = useProjectSettings();
  const { width, height } = element.transform;
  const color = animatedColor(element.color, animation);
  const grow = animation.draw?.stroke ?? 1;
  const w = element.strokeWidth;
  const y = height * 0.65;
  const head = w * 4;
  const middle = width / 2;
  const half = (width / 2 - w) * grow;
  const left = { x: middle - half, y };
  const right = { x: middle + half, y };
  const label =
    element.lang === 'ar' && digits === 'arabic-indic'
      ? toArabicIndicDigits(element.label)
      : element.label;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <g stroke={color} strokeWidth={w} strokeLinecap="round">
        <line x1={w} x2={w} y1={height * 0.3} y2={height} />
        <line x1={width - w} x2={width - w} y1={height * 0.3} y2={height} />
        <line x1={left.x} x2={right.x} y1={y} y2={y} />
      </g>
      <g fill={color}>
        <path d={arrowHead({ x: middle, y }, left, head)} />
        <path d={arrowHead({ x: middle, y }, right, head)} />
      </g>
      {grow >= 1 ? (
        <text
          x={middle}
          y={y - head * 1.2}
          textAnchor="middle"
          fill={color}
          fontFamily={fontStackFor({}, element.lang, theme.fonts)}
          fontSize={element.fontSize}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
};
