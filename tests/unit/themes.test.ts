import { describe, expect, it } from 'vitest';
import { getAnimationPreset } from '../../src/video/animations/registry';
import { applyThemeColors } from '../../src/video/themes/applyTheme';
import {
  PALETTE_TOKENS,
  THEMES,
  resolveColor,
  resolveTheme,
  themeColorRef,
} from '../../src/video/themes/themes';
import { themePreviewProject } from '../../src/video/themes/themePreview';
import { FONT_CATALOG } from '../../src/video/text/fontCatalog';
import { fontStackFor } from '../../src/video/text/fontStack';

describe('thèmes visuels', () => {
  it('propose les 9 thèmes du plan, avec des identifiants uniques', () => {
    expect(THEMES.map((theme) => theme.id)).toEqual([
      'chalkboard',
      'notebook',
      'blueprint',
      'minimal-light',
      'dark-math',
      'neon',
      'lab',
      'kinetic',
      'paper-cut',
    ]);
  });

  it.each(THEMES.map((theme) => [theme.id, theme] as const))(
    '%s : polices, animation et palette valides',
    (_id, theme) => {
      const fontIds = FONT_CATALOG.map((font) => font.id);
      expect(fontIds).toContain(theme.fonts.arabic);
      expect(fontIds).toContain(theme.fonts.latin);
      expect(getAnimationPreset(theme.defaultEnter)?.category).toBe('enter');
      for (const token of PALETTE_TOKENS) {
        expect(theme.palette[token]).toMatch(/^#[0-9a-f]{6}$/);
      }
      expect([theme.name.fr, theme.name.ar, theme.name.en].every((name) => name.length > 0)).toBe(
        true,
      );
    },
  );

  it('résout les références « theme.xxx » et laisse les autres couleurs intactes', () => {
    const theme = resolveTheme('neon');
    expect(resolveColor(themeColorRef('accent1'), theme)).toBe('#22d3ee');
    expect(resolveColor('#123456', theme)).toBe('#123456');
    expect(resolveColor('theme.inconnu', theme)).toBe('theme.inconnu');
  });

  it('applique les couleurs modifiées du projet et revient au thème par défaut', () => {
    const theme = resolveTheme('lab', { accent1: '#ff0000', inconnu: '#00ff00' });
    expect(theme.palette.accent1).toBe('#ff0000');
    expect(theme.palette.accent2).toBe('#0ea5e9');
    expect(resolveTheme('n-existe-pas').id).toBe('minimal-light');
  });

  it('remplace les références dans toute la structure sans la modifier', () => {
    const theme = resolveTheme('chalkboard');
    const scenes = [{ style: { color: 'theme.text' }, runs: [{ color: 'theme.accent1' }], n: 3 }];
    const resolved = applyThemeColors(scenes, theme);
    expect(resolved[0]?.style.color).toBe('#f1f5f0');
    expect(resolved[0]?.runs[0]?.color).toBe('#fde68a');
    expect(scenes[0]?.style.color).toBe('theme.text');
    const plain = [{ color: '#000000' }];
    expect(applyThemeColors(plain, theme)).toBe(plain);
  });

  it('donne au texte sans police choisie les polices du thème selon l’écriture', () => {
    const fonts = resolveTheme('chalkboard').fonts;
    expect(fontStackFor({}, 'ar', fonts)).toMatch(/^"Aref Ruqaa", "Kalam", /);
    expect(fontStackFor({}, 'fr', fonts)).toMatch(/^"Kalam", "Aref Ruqaa", /);
    expect(fontStackFor({ fontId: 'amiri' }, 'ar', fonts)).toMatch(/^"Amiri", /);
  });

  it('fabrique une vignette valide pour chaque thème', () => {
    for (const theme of THEMES) {
      const project = themePreviewProject(theme.id);
      expect(project.themeId).toBe(theme.id);
      expect(project.scenes[0]?.background).toEqual({ type: 'theme' });
    }
  });
});
