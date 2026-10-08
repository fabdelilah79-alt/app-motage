import type { FC } from 'react';
import type { Axes2D } from '../../../shared/schema';
import { axisTicks, type PlotFrame } from './scales';

type Props = {
  axes: Axes2D;
  frame: PlotFrame;
  fontFamily: string;
  format: (value: number) => string;
};

/** Quadrillage, axes fléchés, graduations, nombres et noms des axes (avec unités). */
export const PlotAxes: FC<Props> = ({ axes, frame, fontFamily, format }) => {
  const { sx, sy, left, top, width, height, axisX, axisY } = frame;
  const values = axisTicks(axes);
  const tick = axes.fontSize * 0.3;
  const stroke = Math.max(1.5, axes.fontSize / 12);
  const arrow = axes.fontSize * 0.45;
  const right = left + width;
  const bottom = top + height;
  const originVisible =
    axes.xMin <= 0 && axes.xMax >= 0 && axes.yMin <= 0 && axes.yMax >= 0;
  const text = { fill: axes.color, fontFamily, fontSize: axes.fontSize * 0.8 };

  return (
    <g>
      {axes.grid ? (
        <g stroke={axes.gridColor} strokeWidth={stroke * 0.6}>
          {values.x.map((x) => (
            <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={top} y2={bottom} />
          ))}
          {values.y.map((y) => (
            <line key={`gy${y}`} x1={left} x2={right} y1={sy(y)} y2={sy(y)} />
          ))}
        </g>
      ) : null}
      <g stroke={axes.color} strokeWidth={stroke} strokeLinecap="round">
        <line x1={left} x2={right + (axes.arrows ? arrow * 0.5 : 0)} y1={axisY} y2={axisY} />
        <line x1={axisX} x2={axisX} y1={bottom} y2={top - (axes.arrows ? arrow * 0.5 : 0)} />
        {values.x.map((x) => (
          <line key={`tx${x}`} x1={sx(x)} x2={sx(x)} y1={axisY - tick} y2={axisY + tick} />
        ))}
        {values.y.map((y) => (
          <line key={`ty${y}`} x1={axisX - tick} x2={axisX + tick} y1={sy(y)} y2={sy(y)} />
        ))}
      </g>
      {axes.arrows ? (
        <g fill={axes.color}>
          <path
            d={`M ${right + arrow} ${axisY} l ${-arrow * 1.4} ${-arrow * 0.6} v ${arrow * 1.2} z`}
          />
          <path
            d={`M ${axisX} ${top - arrow} l ${-arrow * 0.6} ${arrow * 1.4} h ${arrow * 1.2} z`}
          />
        </g>
      ) : null}
      {axes.showNumbers ? (
        <g {...text}>
          {values.x
            .filter((x) => Math.abs(sx(x) - axisX) > 1)
            .map((x) => (
              <text key={`nx${x}`} x={sx(x)} y={axisY + tick + axes.fontSize} textAnchor="middle">
                {format(x)}
              </text>
            ))}
          {values.y
            .filter((y) => Math.abs(sy(y) - axisY) > 1)
            .map((y) => (
              <text
                key={`ny${y}`}
                x={axisX - tick * 2}
                y={sy(y) + axes.fontSize * 0.3}
                textAnchor="end"
              >
                {format(y)}
              </text>
            ))}
          {originVisible ? (
            <text x={axisX - tick * 2} y={axisY + tick + axes.fontSize} textAnchor="end">
              {format(0)}
            </text>
          ) : null}
        </g>
      ) : null}
      <g {...text} fontSize={axes.fontSize} fontWeight={700} style={{ unicodeBidi: 'plaintext' }}>
        <text x={right} y={axisY - tick * 2} textAnchor="end">
          {axes.xLabel}
        </text>
        <text x={axisX + tick * 2} y={top - axes.fontSize * 0.2} textAnchor="start">
          {axes.yLabel}
        </text>
      </g>
    </g>
  );
};
