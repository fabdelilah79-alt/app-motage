import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import type { Lang } from '../../shared/schema';

// Polices locales (public/fonts) : aucune connexion nécessaire.
const LOCAL_FONTS = [
  { family: 'Cairo', file: 'fonts/cairo-arabic-400.woff2', weight: '400' },
  { family: 'Cairo', file: 'fonts/cairo-arabic-700.woff2', weight: '700' },
  { family: 'Inter', file: 'fonts/inter-latin-400.woff2', weight: '400' },
  { family: 'Inter', file: 'fonts/inter-latin-700.woff2', weight: '700' },
] as const;

/** Police par défaut selon la langue ; les caractères latins d'un texte arabe passent en Inter. */
export const DEFAULT_FONT_STACKS: Record<Lang, string> = {
  ar: 'Cairo, Inter, sans-serif',
  fr: 'Inter, sans-serif',
  en: 'Inter, sans-serif',
};

let fontsPromise: Promise<void> | null = null;

const loadAllFonts = async (): Promise<void> => {
  await Promise.all(
    LOCAL_FONTS.map((font) =>
      loadFont({ family: font.family, url: staticFile(font.file), weight: font.weight }),
    ),
  );
};

/**
 * Charge les polices locales une seule fois. `loadFont` bloque le rendu (delayRender)
 * jusqu'au chargement : la première image n'est jamais rendue avec une police de secours.
 */
export const loadLocalFonts = (): Promise<void> => {
  fontsPromise ??= loadAllFonts();
  return fontsPromise;
};
