import { describe, expect, it } from 'vitest';
import { formatSeconds, framesToSeconds, secondsToFrames } from '../../src/shared/time';

describe('temps : frames ↔ secondes', () => {
  it('convertit dans les deux sens', () => {
    expect(framesToSeconds(45, 30)).toBe(1.5);
    expect(secondsToFrames(1.5, 30)).toBe(45);
    expect(secondsToFrames(0.51, 60)).toBe(31);
  });

  it('affiche les secondes selon la langue', () => {
    expect(formatSeconds(45, 30, 'fr')).toBe('1,5 s');
    expect(formatSeconds(45, 30, 'en')).toBe('1.5 s');
  });
});
