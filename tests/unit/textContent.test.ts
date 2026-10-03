import { describe, expect, it } from 'vitest';
import { countWords, plainText, suggestTextDuration } from '../../src/shared/textContent';
import type { TextRun } from '../../src/shared/schema';
import { texToSvg } from '../../src/video/science/mathSvg';

describe('longueur du texte et durée suggérée', () => {
  const runs: TextRun[] = [
    { kind: 'text', text: 'La vitesse vaut ' },
    { kind: 'math', latex: 'v = 12' },
  ];

  it('compte les mots (une formule = un mot)', () => {
    expect(plainText(runs)).toBe('La vitesse vaut v = 12');
    expect(countWords(runs)).toBe(4);
    expect(countWords([{ kind: 'text', text: 'السقوط الحر حركة متسارعة' }], 'ar')).toBe(4);
  });

  it('suggère ≈ 3 mots par seconde, au moins 2 s', () => {
    expect(suggestTextDuration(runs, 30)).toBe(60);
    const long: TextRun[] = [{ kind: 'text', text: Array(15).fill('mot').join(' ') }];
    expect(suggestTextDuration(long, 30)).toBe(150);
  });
});

describe('formules MathJax (SVG)', () => {
  it('convertit une formule LaTeX en SVG', () => {
    const svg = texToSvg('E_c = \\frac{1}{2} m v^2');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(texToSvg('E_c = \\frac{1}{2} m v^2')).toBe(svg);
  });

  it('ne plante pas sur une formule incorrecte', () => {
    expect(() => texToSvg('\\frac{1}{')).not.toThrow();
  });
});
