import type { TextRun } from '../../shared/schema';
import { splitBidi } from './bidi';
import { toArabicIndicDigits } from './digits';
import { graphemes, wordParts } from './segment';

/** Unité d'apparition : le morceau entier, mot, graphème (lettre) ou ligne. */
export type Granularity = 'piece' | 'word' | 'grapheme' | 'line';

export type TextToken =
  | { kind: 'text'; runIndex: number; text: string; isolateLtr: boolean; unit: number }
  | { kind: 'math'; runIndex: number; latex: string; unit: number };

type TokenOptions = {
  granularity: Granularity;
  /** Texte affiché de droite à gauche : les suites latines y sont isolées. */
  rtl: boolean;
  /** Chiffres arabes orientaux (hors suites latines isolées et formules). */
  arabicIndicDigits: boolean;
  locale: string;
};

/**
 * Transforme les segments d'un texte en jetons à afficher, numérotés par unité d'apparition.
 * Un mot arabe n'est jamais coupé en plusieurs éléments en mode « mot » ou « ligne ».
 */
export const buildTokens = (runs: readonly TextRun[], options: TokenOptions) => {
  const { granularity } = options;
  const tokens: TextToken[] = [];
  let unit = 0;
  let line = 0;
  const nextUnit = () => (granularity === 'piece' ? 0 : granularity === 'line' ? line : unit++);

  runs.forEach((run, runIndex) => {
    if (run.kind === 'math') {
      tokens.push({ kind: 'math', runIndex, latex: run.latex, unit: nextUnit() });
      return;
    }
    for (const piece of splitBidi(run.text, options.rtl)) {
      const { isolateLtr } = piece;
      const add = (text: string, tokenUnit: number) =>
        tokens.push({ kind: 'text', runIndex, text, isolateLtr, unit: tokenUnit });
      const convert = options.arabicIndicDigits && !isolateLtr;
      const text = convert ? toArabicIndicDigits(piece.text) : piece.text;

      if (isolateLtr || granularity === 'piece') {
        add(text, nextUnit());
      } else if (granularity === 'word') {
        for (const part of wordParts(text, options.locale)) {
          // Espaces et ponctuation apparaissent avec le mot qui les précède.
          add(part.text, part.isWord ? unit++ : Math.max(0, unit - 1));
        }
      } else if (granularity === 'grapheme') {
        for (const character of graphemes(text)) add(character, unit++);
      } else {
        for (const part of text.split(/(\n)/)) {
          if (part) add(part, line);
          if (part === '\n') line++;
        }
      }
    }
  });

  const unitCount = granularity === 'line' ? line + 1 : Math.max(1, unit);
  return { tokens, unitCount };
};

/**
 * Opacité d'une unité pendant une apparition progressive : chaque unité apparaît en fondu
 * sur `overlap` unités de temps, les unités se suivant dans l'ordre de lecture.
 */
export const unitOpacity = (
  unit: number,
  unitCount: number,
  progress: number,
  overlap: number,
): number => {
  const position = progress * (unitCount - 1 + overlap);
  return Math.min(1, Math.max(0, (position - unit) / overlap));
};

/** Machine à écrire : garde les `count` premiers graphèmes (une formule compte pour un). */
export const truncateRuns = (runs: readonly TextRun[], count: number): TextRun[] => {
  const result: TextRun[] = [];
  let remaining = count;
  for (const run of runs) {
    if (remaining <= 0) break;
    if (run.kind === 'math') {
      result.push(run);
      remaining -= 1;
      continue;
    }
    const characters = graphemes(run.text);
    if (characters.length <= remaining) {
      result.push(run);
      remaining -= characters.length;
    } else {
      result.push({ ...run, text: characters.slice(0, remaining).join('') });
      remaining = 0;
    }
  }
  return result;
};

export const countGraphemes = (runs: readonly TextRun[]): number =>
  runs.reduce((total, run) => total + (run.kind === 'math' ? 1 : graphemes(run.text).length), 0);
