import type { Lang, TextStyle } from '../../shared/schema';
import { FONT_CATALOG, type FontEntry } from './fontCatalog';

/** Polices par défaut : les mots d'une autre écriture passent sur la police suivante. */
export const DEFAULT_FONT_STACKS: Record<Lang, string> = {
  ar: '"Cairo", "Inter", sans-serif',
  fr: '"Inter", "Cairo", sans-serif',
  en: '"Inter", "Cairo", sans-serif',
};

export const findFont = (fontId: string | undefined): FontEntry | undefined =>
  fontId ? FONT_CATALOG.find((font) => font.id === fontId) : undefined;

/** Polices du thème du projet : une pour l'arabe, une pour le latin. */
export type ThemeFonts = { arabic: string; latin: string };

/** Sans police choisie : police du thème pour l'écriture du texte, puis celle de l'autre écriture. */
const themeStack = (fonts: ThemeFonts, lang: Lang, base: string) => {
  const order = lang === 'ar' ? [fonts.arabic, fonts.latin] : [fonts.latin, fonts.arabic];
  const families = order
    .map((id) => findFont(id))
    .filter((entry): entry is FontEntry => entry !== undefined)
    .map((entry) => `"${entry.family}"`);
  return families.length > 0 ? `${families.join(', ')}, ${base}` : base;
};

/**
 * Pile de polices d'un texte : police choisie, sinon polices du thème, puis polices par défaut
 * de la langue (les mots d'une autre écriture passent sur la police suivante).
 */
export const fontStackFor = (
  style: Pick<TextStyle, 'fontId' | 'fontFamily'>,
  lang: Lang,
  themeFonts?: ThemeFonts,
) => {
  const base = DEFAULT_FONT_STACKS[lang];
  const entry = findFont(style.fontId);
  if (entry) return `"${entry.family}", ${base}`;
  if (style.fontFamily) return `${style.fontFamily}, ${base}`;
  return themeFonts ? themeStack(themeFonts, lang, base) : base;
};
