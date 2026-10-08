import { describe, expect, it } from 'vitest';
import { fitData, fitEquationLatex, formatNumber, solveLinearSystem } from '../../src/shared/science/fit';

const points = (f: (x: number) => number) =>
  [0, 1, 2, 3, 4, 5].map((x) => [x, f(x)] as [number, number]);

describe('modélisation des données mesurées', () => {
  it('retrouve exactement un modèle linéaire, affine et parabolique', () => {
    const linear = fitData(points((x) => 2.5 * x), 'linear');
    expect(linear?.coefficients[0]).toBeCloseTo(2.5);
    const affine = fitData(points((x) => 2 * x + 1), 'affine');
    expect(affine?.coefficients[0]).toBeCloseTo(2);
    expect(affine?.coefficients[1]).toBeCloseTo(1);
    expect(affine?.r2).toBeCloseTo(1);
    const quadratic = fitData(points((x) => 0.5 * x * x - x + 3), 'quadratic');
    expect(quadratic?.coefficients.map((c) => Number(c.toFixed(6)))).toEqual([0.5, -1, 3]);
  });

  it('retrouve une exponentielle (valeurs positives seulement)', () => {
    const fit = fitData(points((x) => 3 * Math.exp(-0.4 * x)), 'exponential');
    expect(fit?.coefficients[0]).toBeCloseTo(3);
    expect(fit?.coefficients[1]).toBeCloseTo(-0.4);
    expect(fitData([[0, 1], [1, -2]], 'exponential')).toBeNull();
  });

  it('donne un R² plus petit que 1 pour des mesures bruitées', () => {
    const noisy: [number, number][] = [[0, 0.2], [1, 2.1], [2, 4.3], [3, 6.0], [4, 8.2], [5, 9.9]];
    const fit = fitData(noisy, 'affine');
    expect(fit?.r2).toBeGreaterThan(0.99);
    expect(fit?.r2).toBeLessThan(1);
  });

  it('écrit l’équation du modèle en LaTeX', () => {
    const fit = fitData(points((x) => 2 * x - 1), 'affine');
    expect(fit && fitEquationLatex(fit)).toBe('y = 2\\,x - 1');
    expect(formatNumber(0.000123456)).toBe('0.000123');
    expect(formatNumber(Number.NaN)).toBe('?');
  });

  it('refuse les cas impossibles', () => {
    expect(fitData([[1, 1]], 'affine')).toBeNull();
    expect(fitData(points((x) => x), 'none')).toBeNull();
    expect(solveLinearSystem([[1, 2], [2, 4]], [1, 2])).toBeNull();
  });
});
