import { describe, expect, it } from 'vitest';
import { backgroundStyle } from '../../src/video/scenes/backgroundStyle';

describe('fond de scène', () => {
  it('couleur unie', () => {
    expect(backgroundStyle({ type: 'color', color: '#123456' })).toEqual({
      backgroundColor: '#123456',
    });
  });

  it('dégradé linéaire', () => {
    const style = backgroundStyle({
      type: 'linear-gradient',
      angle: 135,
      stops: [
        { color: '#000000', position: 0 },
        { color: '#ffffff', position: 100 },
      ],
    });
    expect(style).toEqual({ backgroundImage: 'linear-gradient(135deg, #000000 0%, #ffffff 100%)' });
  });
});
