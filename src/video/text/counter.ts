import type { TextRun } from '../../shared/schema';

const NUMBER = /\d+(?:[.,]\d+)?/g;

/**
 * Compteur : chaque nombre du texte vaut `progress` × sa valeur finale, avec le même nombre
 * de décimales et le même séparateur (« 12,5 » → « 6,3 » à mi-parcours).
 */
export const countNumbers = (text: string, progress: number): string =>
  text.replace(NUMBER, (match) => {
    const separator = match.includes(',') ? ',' : '.';
    const decimals = match.split(/[.,]/)[1]?.length ?? 0;
    const value = Number(match.replace(',', '.')) * Math.min(1, Math.max(0, progress));
    return value.toFixed(decimals).replace('.', separator);
  });

export const countRuns = (runs: readonly TextRun[], progress: number): TextRun[] =>
  runs.map((run) => (run.kind === 'text' ? { ...run, text: countNumbers(run.text, progress) } : run));
