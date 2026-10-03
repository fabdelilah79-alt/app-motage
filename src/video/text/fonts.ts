import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { FONT_CATALOG } from './fontCatalog';

let fontsPromise: Promise<void> | null = null;

const loadAllFonts = async (): Promise<void> => {
  await Promise.all(
    FONT_CATALOG.flatMap((font) =>
      font.files.map((file) =>
        loadFont({
          family: font.family,
          url: staticFile(file.file),
          weight: file.weight,
          unicodeRange: file.unicodeRange,
        }),
      ),
    ),
  );
};

/**
 * Charge une seule fois toutes les polices locales (public/fonts, aucune connexion nécessaire).
 * `loadFont` bloque le rendu (delayRender) jusqu'au chargement : la première image n'est
 * jamais rendue avec une police de secours.
 */
export const loadLocalFonts = (): Promise<void> => {
  fontsPromise ??= loadAllFonts();
  return fontsPromise;
};
