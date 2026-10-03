import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { TextRun } from '../../src/shared/schema';
import { RichText } from '../../src/video/text/RichText';

const ARABIC = 'الحروف العربية تبقى متصلة';
const runs: TextRun[] = [{ kind: 'text', text: ARABIC }];
const spanTexts = (html: string) =>
  Array.from(html.matchAll(/<span[^>]*>([^<]*)<\/span>/g), (match) => match[1] ?? '');

const render = (mode: 'letter' | 'word' | 'typewriter', progress: number) =>
  renderToStaticMarkup(
    <RichText runs={runs} lang="ar" rtl arabicIndicDigits={false} reveal={{ mode, progress }} />,
  );

describe('rendu du texte arabe animé', () => {
  it('« lettre par lettre » se replie sur « mot par mot » : aucun mot coupé', () => {
    for (const progress of [0, 0.3, 0.7, 1]) {
      const words = spanTexts(render('letter', progress)).filter((part) => part.trim());
      expect(words).toEqual(ARABIC.split(' '));
    }
  });

  it('machine à écrire : une seule chaîne affichée, jamais une lettre par élément', () => {
    const parts = spanTexts(render('typewriter', 0.5));
    expect(parts).toHaveLength(1);
    expect(ARABIC.startsWith(parts[0] ?? '')).toBe(true);
  });
});
