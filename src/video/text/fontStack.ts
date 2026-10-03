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

/** Pile de polices d'un texte : police choisie, puis polices par défaut de la langue. */
export const fontStackFor = (style: Pick<TextStyle, 'fontId' | 'fontFamily'>, lang: Lang) => {
  const base = DEFAULT_FONT_STACKS[lang];
  const entry = findFont(style.fontId);
  if (entry) return `"${entry.family}", ${base}`;
  if (style.fontFamily) return `${style.fontFamily}, ${base}`;
  return base;
};
