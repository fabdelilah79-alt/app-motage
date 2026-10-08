import { describe, expect, it } from 'vitest';
import {
  mathStateAt,
  morphLayouts,
  parseTranslate,
  termOpacities,
  withWidths,
  type MathLayout,
} from '../../src/video/science/mathLayout';
import { texToLayout } from '../../src/video/science/mathSvg';

const term = (signature: string, x: number) => ({ svg: '', x, y: 0, signature, extraTransform: '' });
const layout = (terms: [string, number][], width: number): MathLayout => ({
  minY: -750,
  width,
  height: 1000,
  rootTransform: 'scale(1,-1)',
  terms: withWidths(terms.map(([signature, x]) => term(signature, x)), width),
});

describe('équations animées', () => {
  it('lit la position d’un terme MathJax', () => {
    expect(parseTranslate('translate(1046.8,0)')).toEqual({ x: 1046.8, y: 0, rest: '' });
    expect(parseTranslate('translate(10, -20) scale(0.7)')).toEqual({ x: 10, y: -20, rest: 'scale(0.7)' });
    expect(parseTranslate(null)).toEqual({ x: 0, y: 0, rest: '' });
  });

  it('découpe E_c = ½ m v² en 5 termes, de gauche à droite', () => {
    const result = texToLayout('E_c = \\frac{1}{2} m v^2');
    expect(result?.terms).toHaveLength(5);
    const xs = result?.terms.map((item) => item.x) ?? [];
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(result?.terms.every((item) => item.width > 0)).toBe(true);
    expect(texToLayout('\\frac{1}{')).toBeNull();
  });

  it('terme par terme : chaque terme apparaît à son tour', () => {
    expect(termOpacities(4, 0)).toEqual([0, 0, 0, 0]);
    expect(termOpacities(4, 0.5)).toEqual([1, 1, 0, 0]);
    expect(termOpacities(4, 0.625)).toEqual([1, 1, 0.5, 0]);
    expect(termOpacities(4, 1)).toEqual([1, 1, 1, 1]);
  });

  it('transformation : les termes communs glissent, les autres disparaissent / apparaissent', () => {
    const from = layout([['E', 0], ['=', 1000], ['frac', 2000], ['m', 3000]], 4000);
    const to = layout([['E', 0], ['=', 1000], ['9', 2000]], 3000);
    const start = morphLayouts(from, to, 0);
    const middle = morphLayouts(from, to, 0.5);
    const end = morphLayouts(from, to, 1);
    const moved = (state: typeof start) => state.placed.find((item) => item.key === 'move-1');
    expect(moved(start)?.x).toBe(1000);
    // À la fin, l'équation d'arrivée est centrée sur sa propre largeur.
    expect(moved(end)?.x).toBe(1000);
    expect(end.width).toBe(3000);
    expect(middle.width).toBe(3500);
    const old = (state: typeof start) => state.placed.filter((item) => item.key.startsWith('old'));
    const added = (state: typeof start) => state.placed.filter((item) => item.key.startsWith('new'));
    expect(old(start).every((item) => item.opacity === 1)).toBe(true);
    expect(old(end).every((item) => item.opacity === 0)).toBe(true);
    expect(added(start).every((item) => item.opacity === 0)).toBe(true);
    expect(added(end).every((item) => item.opacity === 1)).toBe(true);
    expect(old(start)).toHaveLength(2);
    expect(added(start)).toHaveLength(1);
  });

  it('enchaîne les étapes de calcul dans le temps', () => {
    const steps = [
      { latex: 'B', at: 100, duration: 20 },
      { latex: 'C', at: 200, duration: 20 },
    ];
    expect(mathStateAt('A', steps, 50)).toEqual({ kind: 'static', latex: 'A' });
    expect(mathStateAt('A', steps, 110)).toEqual({ kind: 'morph', from: 'A', to: 'B', progress: 0.5 });
    expect(mathStateAt('A', steps, 150)).toEqual({ kind: 'static', latex: 'B' });
    expect(mathStateAt('A', [...steps].reverse(), 205)).toMatchObject({ from: 'B', to: 'C' });
    expect(mathStateAt('A', steps, 999)).toEqual({ kind: 'static', latex: 'C' });
  });
});
