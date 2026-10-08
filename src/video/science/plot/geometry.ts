import type { Axes2D, Series2D } from '../../../shared/schema';
import { parseExpression, type Scope } from '../../../shared/science/expression';
import { fitData } from '../../../shared/science/fit';
import {
  sampleCurve,
  sampleFunction,
  type Polyline,
  type Sample,
} from '../../../shared/science/sampling';

type Evaluator = (scope: Scope) => number;

const compile = (source: string): Evaluator => {
  const parsed = parseExpression(source);
  return parsed.ok ? parsed.evaluate : () => Number.NaN;
};

/**
 * Fonction « paramètre → point de la courbe » (x pour y = f(x), t pour une courbe
 * paramétrée, θ pour une courbe polaire). Une seule table de variables est réutilisée
 * pour tous les points (échantillonnage rapide).
 */
export const pointFunction = (series: Series2D, scope: Scope): ((parameter: number) => Sample) => {
  const local: Record<string, number> = { ...scope };
  switch (series.kind) {
    case 'function': {
      const f = compile(series.expr);
      return (x) => {
        local.x = x;
        return [x, f(local)];
      };
    }
    case 'parametric': {
      const fx = compile(series.x);
      const fy = compile(series.y);
      return (t) => {
        local.t = t;
        return [fx(local), fy(local)];
      };
    }
    case 'polar': {
      const fr = compile(series.r);
      return (theta) => {
        local['θ'] = theta;
        const r = fr(local);
        return [r * Math.cos(theta), r * Math.sin(theta)];
      };
    }
    case 'data': {
      const fit = fitData(series.points, series.fit);
      return (x) => [x, fit ? fit.predict(x) : Number.NaN];
    }
  }
};

/**
 * Morceaux de la courbe dans la fenêtre du repère. Données mesurées : courbe du modèle
 * (les points eux-mêmes sont dessinés à part).
 */
export const seriesPolylines = (series: Series2D, axes: Axes2D, scope: Scope): Polyline[] => {
  const point = pointFunction(series, scope);
  switch (series.kind) {
    case 'function':
      return sampleFunction((x) => point(x)[1], axes);
    case 'parametric':
      return sampleCurve(point, series.tMin, series.tMax);
    case 'polar':
      return sampleCurve(point, series.thetaMin, series.thetaMax);
    case 'data':
      return series.fit === 'none' ? [] : sampleFunction((x) => point(x)[1], axes);
  }
};

/** Étendue du paramètre d'une courbe (pour la dérivée numérique). */
export const parameterSpan = (series: Series2D, axes: Axes2D) => {
  switch (series.kind) {
    case 'parametric':
      return series.tMax - series.tMin;
    case 'polar':
      return series.thetaMax - series.thetaMin;
    case 'function':
    case 'data':
      return axes.xMax - axes.xMin;
  }
};

/** Pente dy/dx au point de paramètre donné (dérivée numérique centrée). */
export const slopeAt = (point: (parameter: number) => Sample, parameter: number, span: number) => {
  const h = Math.max(1e-6, Math.abs(span) * 1e-4);
  const [x0, y0] = point(parameter - h);
  const [x1, y1] = point(parameter + h);
  return (y1 - y0) / (x1 - x0);
};
