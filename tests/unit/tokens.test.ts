import { describe, expect, it } from 'vitest';
import type { TextRun } from '../../src/shared/schema';
import {
  buildTokens,
  countGraphemes,
  truncateRuns,
  unitOpacity,
} from '../../src/video/text/tokens';

const options = { rtl: true, arabicIndicDigits: false, locale: 'ar' };
const text = (value: string): TextRun => ({ kind: 'text', text: value });
const texts = (runs: TextRun[], granularity: 'word' | 'line' | 'grapheme' | 'piece') =>
  buildTokens(runs, { ...options, granularity }).tokens.map((token) =>
    token.kind === 'text' ? token.text : token.latex,
  );

describe('découpage du texte pour les animations', () => {
  it('mot par mot : chaque mot arabe reste entier (liaisons préservées)', () => {
    expect(texts([text('السقوط الحر حركة')], 'word')).toEqual(['السقوط', ' ', 'الحر', ' ', 'حركة']);
  });

  it('mot par mot : le nombre et son unité forment une seule unité isolée', () => {
    const words = { ...options, granularity: 'word' as const };
    const { tokens } = buildTokens([text('سرعته 12,5 m/s الآن')], words);
    const unit = tokens.find((token) => token.kind === 'text' && token.text === '12,5 m/s');
    expect(unit).toMatchObject({ isolateLtr: true });
  });

  it('ligne par ligne : une unité par ligne', () => {
    const lines = { ...options, granularity: 'line' as const };
    const { tokens, unitCount } = buildTokens([text('أ\nب\nج')], lines);
    expect(unitCount).toBe(3);
    expect(tokens.map((token) => token.unit)).toEqual([0, 0, 1, 1, 2]);
  });

  it('une formule compte pour une unité et convertit les chiffres hors formule', () => {
    const runs: TextRun[] = [text('العدد 25 '), { kind: 'math', latex: 'x^2' }];
    const result = buildTokens(runs, { ...options, arabicIndicDigits: true, granularity: 'piece' });
    expect(result.tokens).toEqual([
      { kind: 'text', runIndex: 0, text: 'العدد ٢٥ ', isolateLtr: false, unit: 0 },
      { kind: 'math', runIndex: 1, latex: 'x^2', unit: 0 },
    ]);
  });

  it('machine à écrire : sous-chaînes de graphèmes, sans couper un caractère composé', () => {
    const runs: TextRun[] = [text('été'), { kind: 'math', latex: 'v' }, text('ok')];
    expect(countGraphemes(runs)).toBe(6);
    expect(truncateRuns(runs, 1)).toEqual([text('é')]);
    expect(truncateRuns(runs, 4)).toEqual([text('été'), { kind: 'math', latex: 'v' }]);
    expect(truncateRuns([text('مرحبا')], 3)).toEqual([text('مرح')]);
  });

  it('apparition progressive : 0 au début, 1 à la fin, dans l’ordre', () => {
    expect(unitOpacity(0, 5, 0, 2)).toBe(0);
    expect(unitOpacity(4, 5, 1, 2)).toBe(1);
    expect(unitOpacity(0, 5, 0.5, 2)).toBeGreaterThan(unitOpacity(4, 5, 0.5, 2));
  });
});
