import type { FC } from 'react';
import type { Decoration as DecorationData } from './types';

type Props = { decoration: DecorationData; width: number; height: number; rtl: boolean };

/** Trait dessiné progressivement : longueur normalisée à 1 (pathLength). */
const drawn = (progress: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - Math.min(1, Math.max(0, progress)),
});

/**
 * Mise en valeur dessinée autour d'un élément : surlignage, soulignement, cercle, flèche.
 * Le tracé suit le sens de lecture (de droite à gauche pour un texte arabe).
 */
export const Decoration: FC<Props> = ({ decoration, width, height, rtl }) => {
  const { kind, progress, color } = decoration;
  const common = {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    overflow: 'visible' as const,
    pointerEvents: 'none' as const,
  };

  if (kind === 'highlight') {
    const w = width * Math.min(1, Math.max(0, progress));
    return (
      <svg width={width} height={height} style={{ ...common, mixBlendMode: 'multiply' }}>
        <rect
          x={rtl ? width - w : 0}
          y={height * 0.18}
          width={w}
          height={height * 0.64}
          rx={height * 0.08}
          fill={color}
          opacity={0.7}
        />
      </svg>
    );
  }

  const stroke = Math.max(4, Math.min(width, height) * 0.04);
  let d: string;
  if (kind === 'underline') {
    const y = height * 1.04;
    const [x0, x1] = rtl ? [width, 0] : [0, width];
    d = `M${x0},${y} C${(x0 * 2 + x1) / 3},${y + stroke * 2} ${(x0 + x1 * 2) / 3},${y - stroke} ${x1},${y + stroke}`;
  } else if (kind === 'circle') {
    // Ellipse un peu irrégulière, comme tracée à la main (dépasse légèrement son départ).
    const cx = width / 2;
    const cy = height / 2;
    const rx = width * 0.58;
    const ry = height * 0.65;
    const points = Array.from({ length: 49 }, (_, i) => {
      const angle = -Math.PI * 0.6 + (i / 48) * Math.PI * 2.15 * (rtl ? -1 : 1);
      const wobble = 1 + 0.03 * Math.sin(i * 1.7);
      return `${(cx + rx * wobble * Math.cos(angle)).toFixed(1)},${(cy + ry * wobble * Math.sin(angle)).toFixed(1)}`;
    });
    d = `M${points.join(' L')}`;
  } else {
    // Flèche qui arrive en diagonale vers le coin haut de l'élément.
    const tipX = rtl ? width + stroke : -stroke;
    const tipY = height * 0.15;
    const fromX = rtl ? width + height * 0.9 : -height * 0.9;
    const fromY = -height * 0.6;
    const back = rtl ? 1 : -1;
    d =
      `M${fromX},${fromY} Q${(fromX + tipX) / 2},${tipY - height * 0.6} ${tipX},${tipY} ` +
      `M${tipX + back * stroke * 4},${tipY - stroke * 2} L${tipX},${tipY} L${tipX + back * stroke},${tipY - stroke * 4.5}`;
  }

  return (
    <svg width={width} height={height} style={common}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...drawn(progress)}
      />
    </svg>
  );
};
