import type { FC } from 'react';
import { axes2DSchema, type Lang } from '../../shared/schema';
import type { Quantity, SimResult } from '../../shared/simulations/types';
import { PlotAxes } from '../science/plot/PlotAxes';
import { polylinePath } from '../science/plot/PlotSeriesView';
import { formatPlotNumber, plotFrame } from '../science/plot/scales';

type Props = {
  result: SimResult;
  quantity: Quantity;
  index: number;
  width: number;
  height: number;
  color: string;
  textColor: string;
  gridColor: string;
  fontFamily: string;
  fontSize: number;
  lang: Lang;
};

/** Graphique synchronisé : la courbe de la grandeur se trace en même temps que la simulation. */
export const SimGraph: FC<Props> = ({ result, quantity, index, width, height, color, textColor, gridColor, fontFamily, fontSize, lang }) => {
  const t = result.t ?? [];
  const values = (result[quantity.key] ?? []).map((value) => (Number.isFinite(value) ? value : Number.NaN));
  const finite = values.filter(Number.isFinite);
  const min = Math.min(0, ...finite);
  const max = Math.max(0, ...finite);
  const pad = (max - min) * 0.1 || 1;
  const axes = axes2DSchema.parse({
    xMin: 0,
    xMax: Math.max(1e-6, t[t.length - 1] ?? 1),
    yMin: min - (min < 0 ? pad : 0),
    yMax: max + pad,
    xLabel: 't (s)',
    yLabel: `${quantity.name[lang]}${quantity.unit ? ` (${quantity.unit})` : ''}`,
    color: textColor,
    gridColor,
    fontSize,
  });
  const frame = plotFrame(axes, width, height);
  const points: (readonly [number, number])[] = [];
  const lines: (readonly [number, number])[][] = [points];
  for (let k = 0; k <= index && k < values.length; k += 1) {
    const value = values[k];
    if (value !== undefined && Number.isFinite(value)) points.push([t[k] ?? 0, value]);
  }
  const current = points[points.length - 1];
  const format = (value: number) => formatPlotNumber(value, lang, false);
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <PlotAxes axes={axes} frame={frame} fontFamily={fontFamily} format={format} />
      {points.length > 1 ? <path d={polylinePath(lines, frame)} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" /> : null}
      {current ? <circle cx={frame.sx(current[0])} cy={frame.sy(current[1])} r={7} fill={color} /> : null}
    </svg>
  );
};
