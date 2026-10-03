import type { TextRun } from './schema';

/** Texte brut d'une suite de segments (une formule est représentée par son code LaTeX). */
export const plainText = (runs: readonly TextRun[]): string =>
  runs.map((run) => (run.kind === 'text' ? run.text : run.latex)).join('');

/** Nombre de mots (une formule compte pour un mot). */
export const countWords = (runs: readonly TextRun[], locale = 'fr'): number => {
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  return runs.reduce((total, run) => {
    if (run.kind === 'math') return total + 1;
    const words = Array.from(segmenter.segment(run.text)).filter((part) => part.isWordLike);
    return total + words.length;
  }, 0);
};

/** Durée suggérée pour lire un texte : environ 3 mots par seconde, au moins 2 secondes. */
export const suggestTextDuration = (runs: readonly TextRun[], fps: number, locale = 'fr') =>
  Math.round(Math.max(2, countWords(runs, locale) / 3) * fps);
