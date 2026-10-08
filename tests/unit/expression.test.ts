import { describe, expect, it } from 'vitest';
import { evaluateExpression, parseExpression } from '../../src/shared/science/expression';

const value = (source: string, scope: Record<string, number> = {}) =>
  evaluateExpression(source, scope);

describe('lecture des expressions mathématiques', () => {
  it('respecte les priorités des opérations', () => {
    expect(value('1 + 2 * 3')).toBe(7);
    expect(value('(1 + 2) * 3')).toBe(9);
    expect(value('2^3^2')).toBe(512);
    expect(value('-x^2', { x: 3 })).toBe(-9);
    expect(value('2^-1')).toBe(0.5);
    expect(value('10 / 4 - 1')).toBe(1.5);
  });

  it('accepte la multiplication implicite et les symboles collés', () => {
    expect(value('2x', { x: 4 })).toBe(8);
    expect(value('3(x+1)', { x: 1 })).toBe(6);
    expect(value('(x+1)(x-1)', { x: 3 })).toBe(8);
    expect(value('2 pi')).toBeCloseTo(2 * Math.PI);
    expect(value('3 × 4 − 2')).toBe(10);
    expect(value('x²', { x: 5 })).toBe(25);
  });

  it('connaît les fonctions et les constantes usuelles', () => {
    expect(value('sin(pi/2)')).toBeCloseTo(1);
    expect(value('sqrt(16) + abs(-2)')).toBe(6);
    expect(value('exp(0) + ln(e)')).toBe(2);
    expect(value('log(1000)')).toBeCloseTo(3);
    expect(value('max(1, 5, 3)')).toBe(5);
  });

  it('accepte les lettres grecques, écrites ou en toutes lettres', () => {
    expect(value('A*cos(omega*t)', { A: 2, ω: Math.PI, t: 1 })).toBeCloseTo(-2);
    expect(value('2+cos(3*θ)', { θ: 0 })).toBe(3);
    const parsed = parseExpression('omega*t + phi');
    expect(parsed.ok && parsed.variables.sort()).toEqual(['t', 'φ', 'ω']);
  });

  it('signale les erreurs avec leur position, sans jamais exécuter de code', () => {
    const missing = parseExpression('2*(x+1');
    expect(missing.ok).toBe(false);
    const unexpected = parseExpression('2 # 3');
    expect(unexpected).toMatchObject({ ok: false, position: 2 });
    expect(parseExpression('').ok).toBe(false);
    expect(parseExpression('alert(1)').ok).toBe(true);
    expect(value('alert(1)')).toBeNaN();
    expect(value('y', {})).toBeNaN();
  });
});
