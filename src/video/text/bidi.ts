const ARABIC_LETTER = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export const containsArabic = (text: string): boolean => ARABIC_LETTER.test(text);

/**
 * Suite « gauche à droite » dans un texte arabe : termes latins, symboles grecs, nombres avec
 * unités, petites formules tapées (ex. « 12,5 m/s », « v = 3 m/s », « E = mc² »).
 */
const LTR_RUN =
  /[A-Za-z0-9À-ɏͰ-ϿµΩ](?:[A-Za-z0-9À-ɏͰ-ϿµΩ.,:=+\-−×·*/^_²³°%‰() ]*[A-Za-z0-9À-ɏͰ-ϿµΩ²³°%‰)])?/g;

/** Une suite faite seulement de chiffres n'est pas isolée (elle suit l'option des chiffres). */
const HAS_LETTER_OR_UNIT = /[A-Za-zÀ-ɏͰ-ϿµΩ°%‰]/;

export type BidiPiece = { text: string; isolateLtr: boolean };

/**
 * Découpe un texte en morceaux ; dans un contexte de droite à gauche, les suites latines
 * sont isolées pour s'afficher dans le bon ordre (unicode-bidi: isolate).
 */
export const splitBidi = (text: string, rtlContext: boolean): BidiPiece[] => {
  if (!rtlContext) {
    return text ? [{ text, isolateLtr: false }] : [];
  }
  const pieces: BidiPiece[] = [];
  let last = 0;
  for (const match of text.matchAll(LTR_RUN)) {
    const [found] = match;
    const index = match.index ?? 0;
    if (!HAS_LETTER_OR_UNIT.test(found)) continue;
    if (index > last) pieces.push({ text: text.slice(last, index), isolateLtr: false });
    pieces.push({ text: found, isolateLtr: true });
    last = index + found.length;
  }
  if (last < text.length) pieces.push({ text: text.slice(last), isolateLtr: false });
  return pieces;
};
