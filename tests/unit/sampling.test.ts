import { describe, expect, it } from 'vitest';
import {
  niceStep,
  sampleCurve,
  sampleFunction,
  ticks,
  truncatePolylines,
} from '../../src/shared/science/sampling';
import { evaluateExpression } from '../../src/shared/science/expression';

const window = { xMin: 0, xMax: 10, yMin: 0, yMax: 100 };

describe('échantillonnage des courbes', () => {
  it('Ec = ½·m·v² : chaque point échantillonné est exact', () => {
    const f = (v: number) => evaluateExpression('0.5*m*x^2', { m: 2, x: v });
    const lines = sampleFunction(f, window);
    expect(lines).toHaveLength(1);
    const line = lines[0] ?? [];
    expect(line[0]).toEqual([0, 0]);
    expect(line[line.length - 1]?.[0]).toBe(10);
    for (const [v, ec] of line) expect(ec).toBeCloseTo(v * v, 9);
    // Valeurs de référence : v = 3 m/s → 9 J ; v = 5 m/s → 25 J.
    expect(f(3)).toBe(9);
    expect(f(5)).toBe(25);
  });

  it('ajoute des points là où la courbe se courbe', () => {
    const curved = sampleFunction((x) => Math.sin(x * 3) * 50 + 50, window)[0] ?? [];
    const straight = sampleFunction((x) => 10 * x, window)[0] ?? [];
    expect(curved.length).toBeGreaterThan(straight.length);
  });

  it('coupe la courbe aux asymptotes et aux valeurs impossibles', () => {
    const tan = sampleFunction(Math.tan, { xMin: -4, xMax: 4, yMin: -5, yMax: 5 });
    expect(tan.length).toBeGreaterThanOrEqual(3);
    const sqrt = sampleFunction(Math.sqrt, { xMin: -2, xMax: 4, yMin: -1, yMax: 3 });
    expect(sqrt).toHaveLength(1);
    expect(sqrt[0]?.[0]?.[0]).toBeGreaterThanOrEqual(0);
  });

  it('échantillonne une courbe paramétrée (cercle de rayon 3)', () => {
    const [circle = []] = sampleCurve((t) => [3 * Math.cos(t), 3 * Math.sin(t)], 0, 2 * Math.PI, 100);
    expect(circle).toHaveLength(101);
    for (const [x, y] of circle) expect(Math.hypot(x, y)).toBeCloseTo(3);
  });

  it('tracé progressif : garde les premiers points', () => {
    const lines = [
      [[0, 0], [1, 1], [2, 2], [3, 3]],
      [[5, 5], [6, 6]],
    ] as const;
    const copy = lines.map((line) => line.map(([x, y]) => [x, y] as const));
    expect(truncatePolylines(copy, 0)).toEqual([]);
    expect(truncatePolylines(copy, 0.5)).toEqual([copy[0]?.slice(0, 3)]);
    expect(truncatePolylines(copy, 1)).toEqual(copy);
  });

  it('choisit des graduations rondes', () => {
    expect(niceStep(0, 10)).toBe(2);
    expect(niceStep(0, 100)).toBe(20);
    expect(niceStep(-1, 1)).toBe(0.5);
    expect(ticks(0, 1, 0.2)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(ticks(-3, 3, 2)).toEqual([-2, 0, 2]);
  });
});
