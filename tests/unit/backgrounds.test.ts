import { describe, expect, it } from 'vitest';
import { backgroundStyle } from '../../src/video/scenes/backgroundStyle';
import { particlesAt } from '../../src/video/themes/particles';
import { seedFromId, sketchPaths } from '../../src/video/themes/sketch';
import { textureStyle } from '../../src/video/themes/textures';
import { resolveTheme } from '../../src/video/themes/themes';

const context = (themeId: string, rtl = false) => ({ theme: resolveTheme(themeId), unit: 1, rtl });

describe('fonds de scène des thèmes', () => {
  it('le fond « thème » prend le fond du thème du projet', () => {
    expect(backgroundStyle({ type: 'theme' }, context('kinetic'))).toEqual({
      backgroundColor: '#111827',
    });
    const blueprint = backgroundStyle({ type: 'theme' }, context('blueprint'));
    expect(blueprint.backgroundColor).toBe('#1e3a8a');
    expect(String(blueprint.backgroundImage)).toContain('linear-gradient');
  });

  it('résout les couleurs du thème dans les fonds', () => {
    const style = backgroundStyle({ type: 'color', color: 'theme.accent2' }, context('neon'));
    expect(style).toEqual({ backgroundColor: '#e879f9' });
  });

  it('dessine les textures en CSS, avec la marge du cahier du côté de la lecture', () => {
    const options = { lineColor: '#cccccc', unit: 1, rtl: false };
    expect(textureStyle('grid', '#ffffff', options).backgroundSize).toBe('48px 48px');
    const ltr = String(textureStyle('lined', '#ffffff', options).backgroundImage);
    const rtl = String(textureStyle('lined', '#ffffff', { ...options, rtl: true }).backgroundImage);
    expect(ltr).toContain('90deg');
    expect(rtl).toContain('270deg');
    for (const texture of ['paper', 'slate', 'dots', 'blueprint'] as const) {
      expect(textureStyle(texture, '#123456', options).backgroundColor).toBe('#123456');
    }
  });

  it('les particules sont déterministes et restent dans l’image', () => {
    const a = particlesAt(40, 'graine', 120, 1920, 1080);
    const b = particlesAt(40, 'graine', 120, 1920, 1080);
    expect(a).toEqual(b);
    expect(particlesAt(40, 'autre', 120, 1920, 1080)).not.toEqual(a);
    expect(particlesAt(40, 'graine', 121, 1920, 1080)).not.toEqual(a);
    for (const particle of a) {
      expect(particle.x).toBeGreaterThanOrEqual(0);
      expect(particle.x).toBeLessThan(1920);
      expect(particle.y).toBeGreaterThanOrEqual(0);
      expect(particle.y).toBeLessThan(1080);
    }
  });
});

describe('style dessiné à la main', () => {
  const options = { stroke: '#ffffff', strokeWidth: 4, fill: '#fde68a', seed: seedFromId('forme-1') };

  it('produit toujours le même dessin pour le même élément', () => {
    const square = 'M0 0 L100 0 L100 100 L0 100 Z';
    expect(sketchPaths(square, options)).toEqual(sketchPaths(square, options));
    const other = sketchPaths(square, { ...options, seed: seedFromId('forme-2') });
    expect(other).not.toEqual(sketchPaths(square, options));
  });

  it('sépare le remplissage (hachures) du contour', () => {
    const roles = sketchPaths('M0 0 L100 0 L100 100 Z', options).map((path) => path.role);
    expect(roles).toContain('fill');
    expect(roles).toContain('stroke');
    const open = sketchPaths('M0 0 L100 100', { ...options, fill: 'none' });
    expect(open.every((path) => path.role === 'stroke')).toBe(true);
  });

  it('la graine n’est jamais nulle (0 = hasard non reproductible)', () => {
    for (const id of ['', 'a', 'shape-123', 'élément']) {
      expect(seedFromId(id)).toBeGreaterThan(0);
    }
  });
});
