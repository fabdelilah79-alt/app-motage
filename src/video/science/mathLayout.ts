/** Un terme de premier niveau d'une équation (ex. « E_c », « = », « \frac{1}{2} »…). */
export type MathTerm = {
  /** Contenu SVG du terme (glyphes MathJax), sans sa position. */
  svg: string;
  /** Position horizontale et verticale dans l'équation (unités MathJax : 1000 = 1 em). */
  x: number;
  y: number;
  width: number;
  /** Empreinte des glyphes : deux termes identiques ont la même (transformation d'équation). */
  signature: string;
  /** Transformation propre au terme (rare : échelle, etc.). */
  extraTransform: string;
};

/** Équation découpée en termes, avec sa boîte (viewBox MathJax). */
export type MathLayout = {
  minY: number;
  width: number;
  height: number;
  /** Transformation du groupe principal (retournement vertical MathJax). */
  rootTransform: string;
  terms: MathTerm[];
};

const TRANSLATE = /^translate\(\s*(-?[\d.e+-]+)\s*[, ]\s*(-?[\d.e+-]+)\s*\)\s*(.*)$/;

/** Lit « translate(x,y) reste » : position et transformation restante. */
export const parseTranslate = (transform: string | null | undefined) => {
  const match = TRANSLATE.exec(transform ?? '');
  if (!match) return { x: 0, y: 0, rest: transform ?? '' };
  return { x: Number(match[1]), y: Number(match[2]), rest: match[3] ?? '' };
};

/** Largeur des termes : jusqu'au terme suivant (le dernier va jusqu'au bord droit). */
export const withWidths = (
  terms: Omit<MathTerm, 'width'>[],
  totalWidth: number,
): MathTerm[] =>
  terms.map((term, index) => {
    const next = terms.slice(index + 1).find((item) => item.x > term.x);
    return { ...term, width: Math.max(0, (next?.x ?? totalWidth) - term.x) };
  });

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Opacité de chaque terme pendant l'apparition « terme par terme » (progression 0 → 1). */
export const termOpacities = (count: number, progress: number): number[] =>
  Array.from({ length: count }, (_, index) => clamp01(progress * count - index));

export type PlacedTerm = { key: string; term: MathTerm; x: number; y: number; opacity: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Transformation d'une équation en une autre (étape de calcul) : les termes présents dans
 * les deux glissent vers leur nouvelle place, les autres disparaissent ou apparaissent.
 */
export const morphLayouts = (from: MathLayout, to: MathLayout, progress: number) => {
  const t = clamp01(progress);
  const used = new Set<number>();
  const matches = new Map<number, number>();
  to.terms.forEach((term, toIndex) => {
    const fromIndex = from.terms.findIndex(
      (candidate, index) => !used.has(index) && candidate.signature === term.signature,
    );
    if (fromIndex >= 0) {
      used.add(fromIndex);
      matches.set(toIndex, fromIndex);
    }
  });
  // Les termes centrés : chaque équation est centrée sur la largeur commune.
  const width = lerp(from.width, to.width, t);
  const fromShift = (width - from.width) / 2;
  const toShift = (width - to.width) / 2;
  const placed: PlacedTerm[] = [];
  from.terms.forEach((term, index) => {
    if (used.has(index)) return;
    placed.push({ key: `old-${index}`, term, x: term.x + fromShift, y: term.y, opacity: 1 - t * 2 });
  });
  to.terms.forEach((term, index) => {
    const fromIndex = matches.get(index);
    const source = fromIndex === undefined ? undefined : from.terms[fromIndex];
    if (source) {
      placed.push({
        key: `move-${index}`,
        term,
        x: lerp(source.x + fromShift, term.x + toShift, t),
        y: lerp(source.y, term.y, t),
        opacity: 1,
      });
    } else {
      placed.push({ key: `new-${index}`, term, x: term.x + toShift, y: term.y, opacity: t * 2 - 1 });
    }
  });
  return {
    width,
    minY: Math.min(from.minY, to.minY),
    height: Math.max(from.minY + from.height, to.minY + to.height) - Math.min(from.minY, to.minY),
    rootTransform: to.rootTransform,
    placed: placed.map((item) => ({ ...item, opacity: clamp01(item.opacity) })),
  };
};

export type MathState =
  | { kind: 'static'; latex: string }
  | { kind: 'morph'; from: string; to: string; progress: number };

/** Équation affichée à une frame, d'après les étapes de calcul (triées par début). */
export const mathStateAt = (
  latex: string,
  steps: readonly { latex: string; at: number; duration: number }[],
  frame: number,
): MathState => {
  let current = latex;
  for (const step of [...steps].sort((a, b) => a.at - b.at)) {
    if (frame >= step.at + step.duration) {
      current = step.latex;
    } else if (frame >= step.at) {
      return { kind: 'morph', from: current, to: step.latex, progress: (frame - step.at) / step.duration };
    } else {
      break;
    }
  }
  return { kind: 'static', latex: current };
};
