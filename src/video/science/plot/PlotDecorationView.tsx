import type { FC } from 'react';
import type { PlotDecoration, Series2D } from '../../../shared/schema';
import type { Sample } from '../../../shared/science/sampling';
import { EASINGS } from '../../animations/easings';
import { progressAt } from './animatable';
import { slopeAt } from './geometry';
import type { PlotFrame } from './scales';

type SeriesInfo = { series: Series2D; point: (parameter: number) => Sample; span: number };

type Props = {
  decoration: PlotDecoration;
  /** Courbe visée par la décoration (point mobile, aire). */
  target: SeriesInfo | undefined;
  frame: PlotFrame;
  /** Frame relative au début de l'élément. */
  time: number;
  fontFamily: string;
  fontSize: number;
  format: (value: number) => string;
  /** Fenêtre du repère (pour borner les asymptotes et les aires). */
  window: { xMin: number; xMax: number; yMin: number; yMax: number };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Lignes de rappel en pointillés vers les deux axes. */
const Guides: FC<{ x: number; y: number; frame: PlotFrame; color: string; width: number }> = ({
  x,
  y,
  frame,
  color,
  width,
}) => (
  <path
    d={`M${x} ${y} L${x} ${frame.axisY} M${x} ${y} L${frame.axisX} ${y}`}
    stroke={color}
    strokeWidth={width}
    strokeDasharray={`${width * 3} ${width * 3}`}
    fill="none"
  />
);

/** Point mobile (coordonnées, rappels, tangente), aire, asymptote, point fixe ou note. */
export const PlotDecorationView: FC<Props> = ({
  decoration,
  target,
  frame,
  time,
  fontFamily,
  fontSize,
  format,
  window,
}) => {
  const text = { fill: decoration.color, fontFamily, fontSize: fontSize * 0.8, fontWeight: 700 };
  const thin = Math.max(1.5, fontSize / 14);

  switch (decoration.kind) {
    case 'movingPoint': {
      if (!target || time < decoration.start) return null;
      const progress = EASINGS[decoration.easing](
        progressAt(time, decoration.start, decoration.duration),
      );
      const parameter = decoration.from + (decoration.to - decoration.from) * progress;
      const [x, y] = target.point(parameter);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      const px = frame.sx(x);
      const py = frame.sy(y);
      let tangent: string | null = null;
      if (decoration.tangent) {
        const slope = slopeAt(target.point, parameter, target.span);
        if (Number.isFinite(slope)) {
          // Direction de la tangente en pixels, longueur fixe (35 % de la largeur du tracé).
          const dx = frame.sx(x + 1) - frame.sx(x);
          const dy = frame.sy(y + slope) - frame.sy(y);
          const norm = Math.hypot(dx, dy) || 1;
          const half = (frame.width * 0.35) / 2;
          const ux = (dx / norm) * half;
          const uy = (dy / norm) * half;
          tangent = `M${px - ux} ${py - uy} L${px + ux} ${py + uy}`;
        }
      }
      return (
        <g>
          {decoration.guides ? (
            <Guides x={px} y={py} frame={frame} color={decoration.color} width={thin} />
          ) : null}
          {tangent ? (
            <path d={tangent} stroke={decoration.color} strokeWidth={thin * 2} strokeLinecap="round" />
          ) : null}
          <circle cx={px} cy={py} r={fontSize * 0.32} fill={decoration.color} />
          {decoration.showCoords ? (
            <text x={px + fontSize * 0.5} y={py - fontSize * 0.5} {...text}>
              {`(${format(x)} ; ${format(y)})`}
            </text>
          ) : null}
        </g>
      );
    }
    case 'area': {
      if (!target || target.series.kind !== 'function' || time < decoration.start) return null;
      const progress = progressAt(time, decoration.start, decoration.duration);
      const a = clamp(decoration.from, window.xMin, window.xMax);
      const b = a + (clamp(decoration.to, window.xMin, window.xMax) - a) * progress;
      const steps = 120;
      const points: string[] = [];
      for (let index = 0; index <= steps; index += 1) {
        const x = a + ((b - a) * index) / steps;
        const y = clamp(target.point(x)[1], window.yMin, window.yMax);
        if (Number.isFinite(y)) points.push(`${frame.sx(x)} ${frame.sy(y)}`);
      }
      if (points.length < 2) return null;
      const base = frame.axisY;
      const path = `M${frame.sx(a)} ${base} L${points.join(' L')} L${frame.sx(b)} ${base} Z`;
      return <path d={path} fill={decoration.color} fillOpacity={decoration.opacity} />;
    }
    case 'asymptote': {
      const vertical = decoration.orientation === 'vertical';
      const position = vertical ? frame.sx(decoration.value) : frame.sy(decoration.value);
      const d = vertical
        ? `M${position} ${frame.top} L${position} ${frame.top + frame.height}`
        : `M${frame.left} ${position} L${frame.left + frame.width} ${position}`;
      return (
        <g>
          <path
            d={d}
            stroke={decoration.color}
            strokeWidth={thin * 1.5}
            strokeDasharray={`${thin * 6} ${thin * 4}`}
          />
          {decoration.label ? (
            <text
              x={vertical ? position + fontSize * 0.3 : frame.left + frame.width}
              y={vertical ? frame.top + fontSize : position - fontSize * 0.3}
              textAnchor={vertical ? 'start' : 'end'}
              {...text}
            >
              {decoration.label}
            </text>
          ) : null}
        </g>
      );
    }
    case 'point': {
      const px = frame.sx(decoration.x);
      const py = frame.sy(decoration.y);
      return (
        <g>
          {decoration.guides ? (
            <Guides x={px} y={py} frame={frame} color={decoration.color} width={thin} />
          ) : null}
          <circle cx={px} cy={py} r={fontSize * 0.28} fill={decoration.color} />
          {decoration.label ? (
            <text x={px + fontSize * 0.4} y={py - fontSize * 0.4} {...text}>
              {decoration.label}
            </text>
          ) : null}
        </g>
      );
    }
    case 'annotation':
      return (
        <text
          x={frame.sx(decoration.x)}
          y={frame.sy(decoration.y)}
          {...text}
          style={{ unicodeBidi: 'plaintext' }}
        >
          {decoration.text}
        </text>
      );
  }
};
