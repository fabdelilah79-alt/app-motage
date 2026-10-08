import type { Vec3 } from '../../shared/schema';
import { parseExpression, type Scope } from '../../shared/science/expression';

const compile = (source: string) => {
  const parsed = parseExpression(source);
  return parsed.ok ? parsed.evaluate : () => Number.NaN;
};

export type SurfaceData = {
  /** Sommets en coordonnées du repère (x, y, z), ligne par ligne. */
  points: Vec3[];
  /** Triangles (indices des sommets). */
  indices: number[];
  zMin: number;
  zMax: number;
};

/** Grille de la surface z = f(x, y) ; les valeurs impossibles sont ramenées à 0. */
export const surfaceData = (
  expr: string,
  ranges: { xMin: number; xMax: number; yMin: number; yMax: number },
  resolution: number,
  scope: Scope,
): SurfaceData => {
  const f = compile(expr);
  const local: Record<string, number> = { ...scope };
  const n = Math.max(2, resolution);
  const points: Vec3[] = [];
  let zMin = Number.POSITIVE_INFINITY;
  let zMax = Number.NEGATIVE_INFINITY;
  for (let j = 0; j <= n; j += 1) {
    for (let i = 0; i <= n; i += 1) {
      const x = ranges.xMin + ((ranges.xMax - ranges.xMin) * i) / n;
      const y = ranges.yMin + ((ranges.yMax - ranges.yMin) * j) / n;
      local.x = x;
      local.y = y;
      const value = f(local);
      const z = Number.isFinite(value) ? value : 0;
      zMin = Math.min(zMin, z);
      zMax = Math.max(zMax, z);
      points.push([x, y, z]);
    }
  }
  const indices: number[] = [];
  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) {
      const a = j * (n + 1) + i;
      const b = a + 1;
      const c = a + n + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  return { points, indices, zMin, zMax };
};

/** Points d'une courbe paramétrée 3D (ex. hélice), à pas fixe. */
export const curvePoints = (
  exprs: { x: string; y: string; z: string },
  tMin: number,
  tMax: number,
  scope: Scope,
  samples = 600,
): Vec3[] => {
  const fx = compile(exprs.x);
  const fy = compile(exprs.y);
  const fz = compile(exprs.z);
  const local: Record<string, number> = { ...scope };
  const points: Vec3[] = [];
  for (let index = 0; index <= samples; index += 1) {
    local.t = tMin + ((tMax - tMin) * index) / samples;
    const point: Vec3 = [fx(local), fy(local), fz(local)];
    if (point.every(Number.isFinite)) points.push(point);
  }
  return points;
};

/** Flèches d'un champ de vecteurs sur une grille régulière (longueur = scale × norme, bornée). */
export const fieldArrows = (
  exprs: { fx: string; fy: string; fz: string },
  count: number,
  extent: number,
  scale: number,
  scope: Scope,
): { from: Vec3; to: Vec3 }[] => {
  const fx = compile(exprs.fx);
  const fy = compile(exprs.fy);
  const fz = compile(exprs.fz);
  const local: Record<string, number> = { ...scope };
  const step = count > 1 ? (2 * extent) / (count - 1) : 0;
  const maxLength = step * 0.9 || extent;
  const arrows: { from: Vec3; to: Vec3 }[] = [];
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      for (let k = 0; k < count; k += 1) {
        const from: Vec3 = [-extent + i * step, -extent + j * step, -extent + k * step];
        [local.x, local.y, local.z] = from;
        const v: Vec3 = [fx(local), fy(local), fz(local)];
        if (!v.every(Number.isFinite)) continue;
        const norm = Math.hypot(...v);
        if (norm < 1e-9) continue;
        const length = Math.min(maxLength, norm * scale);
        arrows.push({
          from,
          to: [from[0] + (v[0] / norm) * length, from[1] + (v[1] / norm) * length, from[2] + (v[2] / norm) * length],
        });
      }
    }
  }
  return arrows;
};

/** Couleur d'une hauteur (bleu → cyan → jaune → rouge), pour colorer une surface. */
export const heightColor = (ratio: number): [number, number, number] => {
  const t = Math.min(1, Math.max(0, ratio));
  const stops: [number, number, number][] = [
    [0.15, 0.3, 0.85],
    [0.1, 0.75, 0.85],
    [0.95, 0.85, 0.2],
    [0.9, 0.25, 0.2],
  ];
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const a = stops[index] ?? stops[0];
  const b = stops[index + 1] ?? stops[0];
  if (!a || !b) return [1, 1, 1];
  return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local, a[2] + (b[2] - a[2]) * local];
};

/** Partie visible d'une courbe pendant son tracé (au moins deux points). */
export const visiblePoints = (points: readonly Vec3[], progress: number): Vec3[] =>
  points.slice(0, Math.max(2, Math.round(points.length * Math.min(1, Math.max(0, progress)))));
