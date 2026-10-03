import { describe, expect, it } from 'vitest';
import { dragTiming } from '../../src/editor/timeline/timingDrag';

const initial = { from: 30, duration: 60 };

describe('glisser une barre de la timeline', () => {
  it('déplace la barre sans sortir de la scène', () => {
    expect(dragTiming('move', initial, 10, 150)).toEqual({ from: 40, duration: 60 });
    expect(dragTiming('move', initial, -100, 150)).toEqual({ from: 0, duration: 60 });
    expect(dragTiming('move', initial, 500, 150)).toEqual({ from: 90, duration: 60 });
  });

  it('tire le bord gauche : la fin reste fixe', () => {
    expect(dragTiming('start', initial, 20, 150)).toEqual({ from: 50, duration: 40 });
    expect(dragTiming('start', initial, 200, 150)).toEqual({ from: 89, duration: 1 });
  });

  it('tire le bord droit : le début reste fixe', () => {
    expect(dragTiming('end', initial, -20, 150)).toEqual({ from: 30, duration: 40 });
    expect(dragTiming('end', initial, 500, 150)).toEqual({ from: 30, duration: 120 });
    expect(dragTiming('end', initial, -500, 150)).toEqual({ from: 30, duration: 1 });
  });
});
