import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { textStyleSchema } from '../../src/shared/schema';
import {
  backgroundBoxStyle,
  maskClipPath,
  strokeShadowStyles,
} from '../../src/video/text/effectStyles';
import { FONT_CATALOG } from '../../src/video/text/fontCatalog';
import { fontStackFor } from '../../src/video/text/fontStack';
import { TEXT_STYLE_PRESETS, applyStylePreset } from '../../src/video/text/stylePresets';

const format = { width: 1920, height: 1080, fps: 30 } as const;

describe('polices embarquées', () => {
  it('contient les 21 familles du plan, avec leurs fichiers présents sur le disque', () => {
    expect(FONT_CATALOG).toHaveLength(21);
    for (const font of FONT_CATALOG) {
      expect(font.files.length).toBeGreaterThan(0);
      for (const file of font.files) {
        expect(existsSync(path.resolve('public', file.file))).toBe(true);
      }
    }
    expect(FONT_CATALOG.filter((font) => font.script === 'arabic')).toHaveLength(11);
  });

  it('construit la pile de polices : police choisie puis polices de la langue', () => {
    expect(fontStackFor({ fontId: 'amiri' }, 'ar')).toBe('"Amiri", "Cairo", "Inter", sans-serif');
    expect(fontStackFor({}, 'fr')).toBe('"Inter", "Cairo", sans-serif');
  });
});

describe('préréglages de style de texte', () => {
  it('produisent des styles valides, traduits, avec des polices du catalogue', () => {
    expect(TEXT_STYLE_PRESETS).toHaveLength(10);
    for (const preset of TEXT_STYLE_PRESETS) {
      expect(preset.name.fr && preset.name.ar && preset.name.en).toBeTruthy();
      for (const lang of ['fr', 'ar'] as const) {
        const style = applyStylePreset(preset, lang, format);
        expect(textStyleSchema.parse(style)).toEqual(style);
        if (style.fontId) {
          const font = FONT_CATALOG.find((item) => item.id === style.fontId);
          expect(font?.script).toBe(lang === 'ar' ? 'arabic' : 'latin');
        }
      }
    }
  });
});

describe('effets de texte', () => {
  it('rideau dans le sens de lecture', () => {
    expect(maskClipPath(0.25, true)).toBe('inset(0 0 0 75.00%)');
    expect(maskClipPath(0.25, false)).toBe('inset(0 75.00% 0 0)');
    expect(maskClipPath(1, true)).toBe('inset(0 0 0 0.00%)');
  });

  it('combine ombre et lueur, ajoute contour et soulignement', () => {
    const css = strokeShadowStyles(
      {
        shadow: { color: '#000', blur: 10, offsetX: 2, offsetY: 3 },
        glow: { color: '#0ff', radius: 5 },
        stroke: { color: '#fff', width: 3 },
        underline: { thickness: 4 },
      },
      '#123456',
    );
    expect(css.textShadow).toBe('2px 3px 10px #000, 0 0 5px #0ff, 0 0 10px #0ff');
    expect(css.WebkitTextStroke).toBe('3px #fff');
    expect(css.textDecorationColor).toBe('#123456');
  });

  it('fond : bandeau, pastille ou carte', () => {
    expect(backgroundBoxStyle(undefined)).toEqual({ width: '100%' });
    expect(backgroundBoxStyle({ kind: 'pill', color: '#eee', padding: 10 })).toMatchObject({
      display: 'inline-block',
      borderRadius: 9999,
    });
    expect(backgroundBoxStyle({ kind: 'card', color: '#eee', padding: 10 })).toMatchObject({
      width: '100%',
      borderRadius: 24,
    });
  });
});
