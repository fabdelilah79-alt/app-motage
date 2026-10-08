/**
 * Lit un tableau de mesures collé ou saisi : une ligne par point, « x ; y », « x y » ou
 * deux colonnes copiées d'un tableur (tabulation). La virgule décimale est acceptée.
 */
export const parseDataPoints = (text: string): [number, number][] =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .flatMap((line): [number, number][] => {
      const parts = line
        .split(/\s*[;\t]\s*|\s+/)
        .filter((part) => part !== '')
        .map((part) => Number(part.replace(',', '.')));
      const [x, y] = parts;
      return parts.length >= 2 && Number.isFinite(x) && Number.isFinite(y)
        ? [[x as number, y as number]]
        : [];
    });

/** Tableau de points → texte « x ; y » (une ligne par point). */
export const formatDataPoints = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x} ; ${y}`).join('\n');
