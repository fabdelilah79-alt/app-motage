import { describe, expect, it } from 'vitest';
import { cameraMoveSchema } from '../../src/shared/schema';
import { animatedColor, animationFilter } from '../../src/video/animations/frameStyles';
import { frameWith } from '../../src/video/animations/frame';
import { keyframeColor, keyframeNumber } from '../../src/video/animations/keyframes';
import { parsePoints, pathPoints, pointAlong } from '../../src/video/animations/motionPath';
import { FULL_SHOT, cameraAt, cameraTransform } from '../../src/video/scenes/camera';
import { countNumbers } from '../../src/video/text/counter';

describe('chemins de mouvement', () => {
  it('avance le long d’une ligne brisée selon la distance parcourue', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(pointAlong(points, 0.25)).toEqual({ x: 50, y: 0 });
    expect(pointAlong(points, 0.75)).toEqual({ x: 100, y: 50 });
    expect(pointAlong(points, 1)).toEqual({ x: 100, y: 100 });
  });

  it('lit des points saisis et produit des formes qui partent de 0', () => {
    expect(parsePoints('0,0 10,-5 x 20,0')).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: -5 },
      { x: 20, y: 0 },
    ]);
    for (const form of ['arc', 'wave', 'zigzag', 'loop'] as const) {
      expect(pathPoints(form, 300, 100, '')[0]).toEqual({ x: 0, y: 0 });
    }
  });
});

describe('caméra de scène', () => {
  const move = (value: Record<string, unknown>) =>
    cameraMoveSchema.parse({ id: 'm', duration: 10, easing: 'linear', ...value });

  it('zoome vers une zone puis revient au plan large', () => {
    const moves = [
      move({ kind: 'zoom', from: 0, centerX: 0.25, centerY: 0.25, zoom: 2 }),
      move({ kind: 'reset', from: 20 }),
    ];
    expect(cameraAt(moves, 0)).toEqual(FULL_SHOT);
    expect(cameraAt(moves, 5)).toEqual({ centerX: 0.375, centerY: 0.375, zoom: 1.5 });
    expect(cameraAt(moves, 15)).toEqual({ centerX: 0.25, centerY: 0.25, zoom: 2 });
    expect(cameraAt(moves, 40)).toEqual(FULL_SHOT);
  });

  it('panoramique : garde le zoom en cours', () => {
    const moves = [
      move({ kind: 'zoom', from: 0, zoom: 2 }),
      move({ kind: 'pan', from: 10, centerX: 0.7, zoom: 4 }),
    ];
    expect(cameraAt(moves, 30).zoom).toBe(2);
  });

  it('ne montre jamais l’extérieur de la scène', () => {
    expect(cameraTransform(FULL_SHOT, 1920, 1080)).toBe('translate(0.00px, 0.00px) scale(1.0000)');
    // Centre demandé dans le coin : ramené à la limite permise par le zoom 2.
    expect(cameraTransform({ centerX: 0, centerY: 0, zoom: 2 }, 1920, 1080)).toBe(
      'translate(0.00px, 0.00px) scale(2.0000)',
    );
  });
});

describe('images clés (mode Avancé)', () => {
  const keyframes = [
    { frame: 0, value: 100, easing: 'linear' as const },
    { frame: 10, value: 200, easing: 'linear' as const },
  ];

  it('interpole entre deux images clés et garde les valeurs aux extrémités', () => {
    expect(keyframeNumber(keyframes, 5)).toBe(150);
    expect(keyframeNumber(keyframes, -3)).toBe(100);
    expect(keyframeNumber(keyframes, 50)).toBe(200);
    expect(keyframeNumber(undefined, 5)).toBeUndefined();
  });

  it('interpole les couleurs', () => {
    const colors = [
      { frame: 0, value: '#000000', easing: 'linear' as const },
      { frame: 10, value: '#ffffff', easing: 'linear' as const },
    ];
    expect(keyframeColor(colors, 0)).toBe('#000000');
    expect(keyframeColor(colors, 5)).toMatch(/^rgba?\(/);
  });
});

describe('effets visuels', () => {
  it('compteur : les nombres défilent avec leurs décimales', () => {
    expect(countNumbers('v = 12,5 m/s', 0.5)).toBe('v = 6,3 m/s');
    expect(countNumbers('100 et 2.50', 0)).toBe('0 et 0.00');
  });

  it('couleur : changement progressif et filtres', () => {
    expect(animatedColor('#000', frameWith({}))).toBe('#000');
    expect(animatedColor('#000', frameWith({ colorShift: { color: '#f00', amount: 0.25 } }))).toBe(
      'color-mix(in srgb, #000 75%, #f00)',
    );
    expect(animationFilter(frameWith({ blur: 4 }))).toBe('blur(4.00px)');
    expect(animationFilter(frameWith({}))).toBeUndefined();
  });
});
