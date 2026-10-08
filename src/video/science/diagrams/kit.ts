import type { SVGAttributes } from 'react';
import type { DiagramParamField, DiagramParams, DiagramStyle } from './types';

/** Trait du schéma (animable avec « Tracé » : longueur normalisée à 1). */
export const line = (style: DiagramStyle, color = style.color, scale = 1): SVGAttributes<SVGElement> => ({
  stroke: color,
  strokeWidth: style.strokeWidth * scale,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
  pathLength: 1,
  strokeDasharray: style.draw ? 1 : undefined,
  strokeDashoffset: style.draw ? 1 - style.draw.stroke : undefined,
});

/** Surface remplie (apparaît après le tracé du contour). */
export const area = (style: DiagramStyle, color = style.fill): SVGAttributes<SVGElement> => ({
  fill: color,
  fillOpacity: style.draw ? style.draw.fill : 1,
  stroke: 'none',
});

/** Contour + remplissage. */
export const shape = (style: DiagramStyle, fill = style.fill): SVGAttributes<SVGElement> => ({
  ...line(style),
  fill,
  fillOpacity: style.draw ? style.draw.fill : 1,
});

/** Lettre ou symbole au centre d'un composant (A, V, N, S, m…). */
export const letter = (style: DiagramStyle, size: number, color = style.color) => ({
  fill: color,
  fontSize: size,
  fontWeight: 700,
  textAnchor: 'middle' as const,
  dominantBaseline: 'central' as const,
  fontFamily: 'Inter, sans-serif',
  opacity: style.draw ? style.draw.fill : 1,
});

/** Hachures obliques le long d'un segment horizontal (sol, support, dos de miroir). */
export const hatches = (x0: number, x1: number, y: number, depth: number, step: number) => {
  const parts: string[] = [];
  for (let x = x0; x < x1; x += step) parts.push(`M${x} ${y} l${-depth} ${depth}`);
  return parts.join(' ');
};

const fieldDefault = (fields: readonly DiagramParamField[], key: string) =>
  fields.find((field) => field.key === key)?.default;

export const numberParam = (params: DiagramParams, fields: readonly DiagramParamField[], key: string) => {
  const value = params[key];
  const fallback = fieldDefault(fields, key);
  return typeof value === 'number' ? value : typeof fallback === 'number' ? fallback : 0;
};

export const booleanParam = (params: DiagramParams, fields: readonly DiagramParamField[], key: string) => {
  const value = params[key];
  const fallback = fieldDefault(fields, key);
  return typeof value === 'boolean' ? value : fallback === true;
};

export const selectParam = (params: DiagramParams, fields: readonly DiagramParamField[], key: string) => {
  const value = params[key];
  const fallback = fieldDefault(fields, key);
  return typeof value === 'string' ? value : typeof fallback === 'string' ? fallback : '';
};
