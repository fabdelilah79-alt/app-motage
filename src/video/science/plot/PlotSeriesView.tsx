import type { FC } from 'react';
import type { Series2D } from '../../../shared/schema';
import { truncatePolylines, type Polyline } from '../../../shared/science/sampling';
import type { PlotFrame } from './scales';

type Props = {
  series: Series2D;
  lines: readonly Polyline[];
  /** Tracé progressif (0 → 1). */
  progress: number;
  frame: PlotFrame;
  fontFamily: string;
  fontSize: number;
};

export const polylinePath = (lines: readonly Polyline[], frame: PlotFrame): string =>
  lines
    .map((line) =>
      line
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${frame.sx(x).toFixed(2)} ${frame.sy(y).toFixed(2)}`)
        .join(' '),
    )
    .join(' ');

const Marker: FC<{ kind: 'circle' | 'square' | 'cross'; x: number; y: number; size: number }> = ({
  kind,
  x,
  y,
  size,
}) => {
  switch (kind) {
    case 'circle':
      return <circle cx={x} cy={y} r={size} />;
    case 'square':
      return <rect x={x - size} y={y - size} width={size * 2} height={size * 2} />;
    case 'cross':
      return (
        <path
          d={`M${x - size} ${y - size} L${x + size} ${y + size} M${x - size} ${y + size} L${x + size} ${y - size}`}
          fill="none"
          strokeWidth={size * 0.5}
        />
      );
  }
};

/** Une courbe (tracé progressif) ; données mesurées : points puis courbe du modèle. */
export const PlotSeriesView: FC<Props> = ({ series, lines, progress, frame, fontFamily, fontSize }) => {
  const dash = series.dashed ? `${series.width * 3} ${series.width * 2}` : undefined;
  const isData = series.kind === 'data';
  // Données : les points apparaissent pendant les 2/3 du tracé, puis le modèle.
  const pointsProgress = isData ? Math.min(1, progress * 1.5) : 0;
  const curveProgress = isData ? Math.max(0, progress * 3 - 2) : progress;
  const visible = truncatePolylines(lines, curveProgress);
  const lastLine = visible[visible.length - 1];
  const end = lastLine?.[lastLine.length - 1];

  return (
    <g>
      {visible.length > 0 ? (
        <path
          d={polylinePath(visible, frame)}
          fill="none"
          stroke={series.color}
          strokeWidth={isData ? series.width * 0.7 : series.width}
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {series.kind === 'data' ? (
        <g fill={series.color} stroke={series.color}>
          {series.points
            .slice(0, Math.round(series.points.length * pointsProgress))
            .map(([x, y], index) => (
              <Marker
                key={index}
                kind={series.marker}
                x={frame.sx(x)}
                y={frame.sy(y)}
                size={series.width * 1.4}
              />
            ))}
        </g>
      ) : null}
      {series.label && end && progress >= 1 ? (
        <text
          x={frame.sx(end[0]) + fontSize * 0.3}
          y={frame.sy(end[1]) - fontSize * 0.3}
          fill={series.color}
          fontFamily={fontFamily}
          fontSize={fontSize * 0.8}
          fontWeight={700}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {series.label}
        </text>
      ) : null}
    </g>
  );
};
