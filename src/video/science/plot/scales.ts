import type { Axes2D, Lang } from '../../../shared/schema';
import { niceStep, ticks } from '../../../shared/science/sampling';
import { toArabicIndicDigits } from '../../text/digits';

/** Zone de tracé dans la boîte de l'élément (marges pour les nombres et les noms des axes). */
export type PlotFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  /** Coordonnées du repère → pixels. */
  sx: (x: number) => number;
  sy: (y: number) => number;
  /** Position des axes (y = 0 et x = 0 s'ils sont visibles, sinon le bord). */
  axisY: number;
  axisX: number;
};

export const plotFrame = (axes: Axes2D, boxWidth: number, boxHeight: number): PlotFrame => {
  const f = axes.fontSize;
  const left = f * 2.6;
  const right = f * 1.4;
  const top = f * 1.4;
  const bottom = f * 2.2;
  const width = Math.max(10, boxWidth - left - right);
  const height = Math.max(10, boxHeight - top - bottom);
  const spanX = axes.xMax - axes.xMin || 1;
  const spanY = axes.yMax - axes.yMin || 1;
  const sx = (x: number) => left + ((x - axes.xMin) / spanX) * width;
  const sy = (y: number) => top + ((axes.yMax - y) / spanY) * height;
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return {
    left,
    top,
    width,
    height,
    sx,
    sy,
    axisY: sy(clamp(0, axes.yMin, axes.yMax)),
    axisX: sx(clamp(0, axes.xMin, axes.xMax)),
  };
};

export const axisTicks = (axes: Axes2D) => ({
  x: ticks(axes.xMin, axes.xMax, axes.xStep > 0 ? axes.xStep : niceStep(axes.xMin, axes.xMax)),
  y: ticks(axes.yMin, axes.yMax, axes.yStep > 0 ? axes.yStep : niceStep(axes.yMin, axes.yMax)),
});

/** Nombre affiché : virgule décimale en français et en arabe, chiffres ٠-٩ si demandé. */
export const formatPlotNumber = (
  value: number,
  lang: Lang,
  arabicDigits: boolean,
  precision = 4,
): string => {
  const rounded = Number(value.toPrecision(precision));
  let text = String(Math.abs(rounded) < 1e-12 ? 0 : rounded);
  if (lang !== 'en') text = text.replace('.', ',');
  return arabicDigits ? toArabicIndicDigits(text) : text;
};
