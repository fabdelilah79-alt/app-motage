import { describe, expect, it } from 'vitest';
import { histogramBins, pieSlices, slicePath, staggeredProgress } from '../../src/video/science/chartLayout';
import { arrowHead, vectorGeometry, vectorLabel } from '../../src/video/science/vectorGeometry';

describe('graphiques de données', () => {
  it('regroupe les valeurs en classes', () => {
    const bins = histogramBins([1, 2, 2, 3, 3, 3, 4], 3);
    expect(bins).toHaveLength(3);
    expect(bins.reduce((sum, bin) => sum + bin.value, 0)).toBe(7);
    expect(histogramBins([], 4)).toEqual([]);
  });

  it('les secteurs couvrent tout le disque à la fin', () => {
    const slices = pieSlices([1, 1, 2], 1);
    expect(slices[2]?.end).toBeCloseTo(2 * Math.PI);
    expect(slices[1]?.start).toBeCloseTo(Math.PI / 2);
    const half = pieSlices([1, 1, 2], 0.5);
    expect(half[2]?.end).toBeCloseTo(Math.PI);
    expect(half[2]?.start).toBeCloseTo(Math.PI);
    expect(slicePath(0, 0, 10, { start: 0, end: 0 })).toBe('');
  });

  it('les barres poussent l’une après l’autre', () => {
    expect(staggeredProgress(3, 0, 10, 5)).toEqual([0, 0, 0]);
    expect(staggeredProgress(3, 10, 10, 5)).toEqual([1, 0.5, 0]);
  });
});

describe('vecteurs', () => {
  it('longueur proportionnelle à la norme et direction selon l’angle', () => {
    const geometry = vectorGeometry({ originX: 0.5, originY: 0.5, angle: 90, value: 4, pxPerUnit: 25 }, 400, 400);
    expect(geometry.length).toBe(100);
    expect(geometry.tip.x).toBeCloseTo(200);
    expect(geometry.tip.y).toBeCloseTo(100);
    expect(arrowHead({ x: 0, y: 0 }, { x: 10, y: 0 }, 4)).toMatch(/^M10 0 L/);
  });

  it('écrit le nom et la valeur du vecteur', () => {
    expect(vectorLabel({ label: '\\vec{F}', showValue: false, value: 3, unit: 'N' })).toBe('\\vec{F}');
    expect(vectorLabel({ label: '\\vec{v}', showValue: true, value: 3, unit: 'm/s' })).toBe('\\vec{v} = 3\\,\\text{m/s}');
  });
});
