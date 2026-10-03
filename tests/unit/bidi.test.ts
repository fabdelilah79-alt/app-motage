import { describe, expect, it } from 'vitest';
import { containsArabic, splitBidi } from '../../src/video/text/bidi';
import { toArabicIndicDigits } from '../../src/video/text/digits';

describe('texte bidirectionnel (arabe + latin)', () => {
  it('isole un nombre avec son unité latine dans un texte arabe', () => {
    expect(splitBidi('سرعة الجسم 12,5 m/s تقريبًا', true)).toEqual([
      { text: 'سرعة الجسم ', isolateLtr: false },
      { text: '12,5 m/s', isolateLtr: true },
      { text: ' تقريبًا', isolateLtr: false },
    ]);
  });

  it('isole une petite formule tapée et un terme latin', () => {
    const pieces = splitBidi('قانون نيوتن F = m·a هنا', true);
    expect(pieces.filter((piece) => piece.isolateLtr).map((piece) => piece.text)).toEqual([
      'F = m·a',
    ]);
  });

  it("n'isole pas un nombre seul (il suit l'option des chiffres)", () => {
    expect(splitBidi('العدد 12 فقط', true).every((piece) => !piece.isolateLtr)).toBe(true);
  });

  it('ne découpe pas un texte de gauche à droite', () => {
    expect(splitBidi('La vitesse est de 12,5 m/s', false)).toEqual([
      { text: 'La vitesse est de 12,5 m/s', isolateLtr: false },
    ]);
  });

  it('détecte les lettres arabes et convertit les chiffres', () => {
    expect(containsArabic('Hello')).toBe(false);
    expect(containsArabic('مرحبا')).toBe(true);
    expect(toArabicIndicDigits('العدد 2026')).toBe('العدد ٢٠٢٦');
  });
});
