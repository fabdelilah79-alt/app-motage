import { describe, expect, it } from 'vitest';
import { series2DSchema } from '../../src/shared/schema';
import { numberAt, progressAt, scopeAt } from '../../src/video/science/plot/animatable';
import { parameterSpan, pointFunction, seriesPolylines, slopeAt } from '../../src/video/science/plot/geometry';
import { formatPlotNumber, plotFrame } from '../../src/video/science/plot/scales';
import { axes2DSchema } from '../../src/shared/schema';

const axes = axes2DSchema.parse({ xMin: 0, xMax: 10, yMin: 0, yMax: 100 });

describe('repères et courbes', () => {
  it('point et pente de Ec = ½·m·v² (m = 2 kg)', () => {
    const series = series2DSchema.parse({ id: 's', kind: 'function', expr: '0.5*m*x^2', params: { m: { value: 2 } } });
    const point = pointFunction(series, scopeAt(series.params, 0));
    expect(point(3)).toEqual([3, 9]);
    expect(slopeAt(point, 3, parameterSpan(series, axes))).toBeCloseTo(6, 4);
  });

  it('courbes paramétrée et polaire', () => {
    const circle = series2DSchema.parse({ id: 'c', kind: 'parametric', x: 'R*cos(t)', y: 'R*sin(t)', params: { R: { value: 2 } } });
    const [x, y] = pointFunction(circle, scopeAt(circle.params, 0))(Math.PI / 2);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(2);
    const rose = series2DSchema.parse({ id: 'r', kind: 'polar', r: '2+cos(3*theta)' });
    expect(pointFunction(rose, {})(0)).toEqual([3, 0]);
  });

  it('données : courbe du modèle seulement si une modélisation est choisie', () => {
    const data = series2DSchema.parse({ id: 'd', kind: 'data', points: [[0, 1], [1, 3], [2, 5]] });
    expect(seriesPolylines(data, axes, {})).toEqual([]);
    const fitted = series2DSchema.parse({ ...data, fit: 'affine' });
    const [line = []] = seriesPolylines(fitted, axes, {});
    expect(line[0]?.[1]).toBeCloseTo(1);
  });

  it('un paramètre animé fait varier la courbe dans le temps', () => {
    const omega = { value: 1, to: 3, start: 30, duration: 60, easing: 'linear' as const };
    expect(numberAt(omega, 0)).toBe(1);
    expect(numberAt(omega, 60)).toBe(2);
    expect(numberAt(omega, 200)).toBe(3);
    expect(scopeAt({ omega }, 90)).toEqual({ ω: 3 });
    expect(progressAt(10, 20, 0)).toBe(0);
    expect(progressAt(20, 20, 0)).toBe(1);
  });

  it('place le repère et écrit les nombres selon la langue', () => {
    const frame = plotFrame(axes, 1000, 600);
    expect(frame.sx(0)).toBeCloseTo(frame.left);
    expect(frame.sx(10)).toBeCloseTo(frame.left + frame.width);
    expect(frame.sy(0)).toBeCloseTo(frame.top + frame.height);
    expect(frame.axisY).toBeCloseTo(frame.sy(0));
    expect(formatPlotNumber(2.5, 'fr', false)).toBe('2,5');
    expect(formatPlotNumber(2.5, 'en', false)).toBe('2.5');
    expect(formatPlotNumber(12.5, 'ar', true)).toBe('١٢,٥');
  });
});
