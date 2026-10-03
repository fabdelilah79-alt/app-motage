import { describe, expect, it } from 'vitest';
import { fadeInOpacity } from '../../src/video/animations/fade';

describe('fadeInOpacity', () => {
  it('vaut 0 avant et au début du fondu', () => {
    expect(fadeInOpacity(0, 10, 30)).toBe(0);
    expect(fadeInOpacity(10, 10, 30)).toBe(0);
  });

  it('vaut 0,5 au milieu du fondu', () => {
    expect(fadeInOpacity(25, 10, 30)).toBeCloseTo(0.5);
  });

  it('vaut 1 à la fin du fondu et après', () => {
    expect(fadeInOpacity(40, 10, 30)).toBe(1);
    expect(fadeInOpacity(500, 10, 30)).toBe(1);
  });

  it('passe directement de 0 à 1 si la durée est nulle', () => {
    expect(fadeInOpacity(9, 10, 0)).toBe(0);
    expect(fadeInOpacity(10, 10, 0)).toBe(1);
  });
});
