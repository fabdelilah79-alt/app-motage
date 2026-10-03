const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/** Découpe en graphèmes (caractères visibles), sans jamais séparer une lettre de ses signes. */
export const graphemes = (text: string): string[] =>
  Array.from(graphemeSegmenter.segment(text), (part) => part.segment);

export type WordPart = { text: string; isWord: boolean };

/** Découpe en mots et séparateurs (espaces, ponctuation), selon les règles de la langue. */
export const wordParts = (text: string, locale: string): WordPart[] =>
  Array.from(new Intl.Segmenter(locale, { granularity: 'word' }).segment(text), (part) => ({
    text: part.segment,
    isWord: part.isWordLike ?? false,
  }));
