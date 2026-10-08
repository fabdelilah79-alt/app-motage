/** Point d'une courbe, en coordonnées du repère. */
export type Sample = readonly [number, number];
/** Morceau continu d'une courbe (une courbe coupée par une asymptote a plusieurs morceaux). */
export type Polyline = Sample[];

type Window = { xMin: number; xMax: number; yMin: number; yMax: number };

const INITIAL_SAMPLES = 160;
const MAX_DEPTH = 6;

/**
 * Échantillonnage adaptatif de y = f(x) : pas fixe de départ, puis subdivision là où la
 * courbe se courbe (écart au milieu). Coupe la courbe aux valeurs impossibles et aux sauts
 * (ex. tan x). Les valeurs très éloignées de la fenêtre sont bornées.
 */
export const sampleFunction = (f: (x: number) => number, window: Window): Polyline[] => {
  const { xMin, xMax, yMin, yMax } = window;
  const range = Math.max(1e-9, yMax - yMin);
  const tolerance = range * 0.0015;
  const limitLow = yMin - range * 2;
  const limitHigh = yMax + range * 2;
  const clampY = (y: number) => Math.min(limitHigh, Math.max(limitLow, y));
  const isJump = (a: number, b: number) =>
    Math.abs(b - a) > range * 3 && Math.sign(a - (yMin + yMax) / 2) !== Math.sign(b - (yMin + yMax) / 2);

  const lines: Polyline[] = [];
  let current: Polyline = [];
  const push = (x: number, y: number) => {
    if (!Number.isFinite(y)) {
      if (current.length > 1) lines.push(current);
      current = [];
      return;
    }
    const last = current[current.length - 1];
    if (last && isJump(last[1], y)) {
      if (current.length > 1) lines.push(current);
      current = [];
    }
    current.push([x, y]);
  };

  const refine = (x0: number, y0: number, x1: number, y1: number, depth: number) => {
    const xm = (x0 + x1) / 2;
    const ym = f(xm);
    const smooth =
      Number.isFinite(y0) &&
      Number.isFinite(y1) &&
      Number.isFinite(ym) &&
      Math.abs(ym - (y0 + y1) / 2) <= tolerance;
    if (depth >= MAX_DEPTH || smooth) {
      push(x1, y1);
      return;
    }
    refine(x0, y0, xm, ym, depth + 1);
    refine(xm, ym, x1, y1, depth + 1);
  };

  const step = (xMax - xMin) / INITIAL_SAMPLES;
  let previousX = xMin;
  let previousY = f(xMin);
  push(previousX, previousY);
  for (let index = 1; index <= INITIAL_SAMPLES; index += 1) {
    const x = index === INITIAL_SAMPLES ? xMax : xMin + index * step;
    const y = f(x);
    refine(previousX, previousY, x, y, 0);
    previousX = x;
    previousY = y;
  }
  if (current.length > 1) lines.push(current);
  return lines.map((line) => line.map(([x, y]) => [x, clampY(y)] as const));
};

/** Courbe paramétrée (x(t), y(t)) ou polaire, à pas fixe. */
export const sampleCurve = (
  point: (t: number) => Sample,
  tMin: number,
  tMax: number,
  samples = 720,
): Polyline[] => {
  const lines: Polyline[] = [];
  let current: Polyline = [];
  for (let index = 0; index <= samples; index += 1) {
    const t = tMin + ((tMax - tMin) * index) / samples;
    const [x, y] = point(t);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      current.push([x, y]);
    } else {
      if (current.length > 1) lines.push(current);
      current = [];
    }
  }
  if (current.length > 1) lines.push(current);
  return lines;
};

/** Premiers points d'une courbe (tracé progressif de 0 à 1), morceau par morceau. */
export const truncatePolylines = (lines: readonly Polyline[], progress: number): Polyline[] => {
  if (progress >= 1) return [...lines];
  const total = lines.reduce((count, line) => count + line.length, 0);
  let remaining = Math.round(total * Math.max(0, progress));
  const result: Polyline[] = [];
  for (const line of lines) {
    if (remaining <= 1) break;
    result.push(line.slice(0, remaining));
    remaining -= line.length;
  }
  return result;
};

/** Graduations « rondes » : pas de 1, 2 ou 5 × 10ⁿ pour environ `target` graduations. */
export const niceStep = (min: number, max: number, target = 8): number => {
  const raw = Math.abs(max - min) / Math.max(1, target);
  if (raw === 0 || !Number.isFinite(raw)) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
};

/** Valeurs des graduations entre min et max (multiples du pas). */
export const ticks = (min: number, max: number, step: number): number[] => {
  if (step <= 0 || !Number.isFinite(step)) return [];
  const first = Math.ceil(min / step - 1e-9) * step;
  const values: number[] = [];
  for (let value = first; value <= max + step * 1e-9 && values.length < 200; value += step) {
    values.push(Math.abs(value) < step * 1e-9 ? 0 : Number(value.toPrecision(12)));
  }
  return values;
};
