import type { CSSProperties } from 'react';
import type { TextRun } from '../../shared/schema';
import type { TextReveal } from '../animations/types';
import { InlineMath } from '../science/InlineMath';
import { containsArabic } from './bidi';
import { highlightStyle } from './effectStyles';
import { buildTokens, countGraphemes, truncateRuns, unitOpacity, type Granularity } from './tokens';

type Props = {
  runs: readonly TextRun[];
  lang: string;
  rtl: boolean;
  arabicIndicDigits: boolean;
  reveal: TextReveal | undefined;
  /** Couleur des formules quand le texte est rempli par un dégradé. */
  mathColor?: string;
};

const GRANULARITY: Record<string, Granularity> = { word: 'word', letter: 'grapheme', line: 'line' };
const OVERLAP: Record<Granularity, number> = { piece: 1, word: 2, grapheme: 3, line: 1 };

/**
 * Contenu d'un texte riche (segments stylés + formules), avec isolation bidi et révélation
 * progressive compatible avec l'arabe.
 */
export const RichText = ({ runs, lang, rtl, arabicIndicDigits, reveal, mathColor }: Props) => {
  let mode = reveal?.mode;
  const hasArabic = lang === 'ar' || runs.some((r) => r.kind === 'text' && containsArabic(r.text));
  // Jamais de lettre par lettre en arabe : les lettres doivent rester liées → mot par mot.
  if (mode === 'letter' && hasArabic) {
    mode = 'word';
  }
  const progress = reveal?.progress ?? 1;

  // Machine à écrire : on affiche une sous-chaîne de graphèmes, sans découper les mots en éléments.
  const visibleRuns =
    mode === 'typewriter' ? truncateRuns(runs, Math.floor(progress * countGraphemes(runs))) : runs;
  const granularity: Granularity = (mode && GRANULARITY[mode]) ?? 'piece';
  const { tokens, unitCount } = buildTokens(visibleRuns, {
    granularity,
    rtl,
    arabicIndicDigits,
    locale: lang,
  });
  const animated = granularity !== 'piece';

  return (
    <>
      {tokens.map((token, index) => {
        const opacity = animated
          ? unitOpacity(token.unit, unitCount, progress, OVERLAP[granularity])
          : undefined;
        const run = visibleRuns[token.runIndex];
        if (token.kind === 'math') {
          const color = (run?.kind === 'math' ? run.style?.color : undefined) ?? mathColor;
          return <InlineMath key={index} latex={token.latex} color={color} style={{ opacity }} />;
        }
        const runStyle = run?.kind === 'text' ? run.style : undefined;
        const style: CSSProperties = {
          opacity,
          color: runStyle?.color,
          fontWeight: runStyle?.fontWeight,
          fontStyle: runStyle?.italic ? 'italic' : undefined,
          ...(runStyle?.highlight ? highlightStyle(runStyle.highlight) : {}),
          ...(token.isolateLtr ? { unicodeBidi: 'isolate' } : {}),
        };
        return (
          <span key={index} dir={token.isolateLtr ? 'ltr' : undefined} style={style}>
            {token.text}
          </span>
        );
      })}
    </>
  );
};
