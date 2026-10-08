import type { FitKind } from '../schema';

export type FitResult = {
  kind: Exclude<FitKind, 'none'>;
  /** Coefficients : linéaire [a], affine [a, b], quadratique [a, b, c], exponentielle [A, k]. */
  coefficients: number[];
  /** Coefficient de détermination R² (1 = modèle parfait). */
  r2: number;
  predict: (x: number) => number;
};

type Point = readonly [number, number];

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/** Résout un petit système linéaire (élimination de Gauss avec pivot partiel). */
export const solveLinearSystem = (matrix: number[][], vector: number[]): number[] | null => {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i] ?? 0]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row]?.[col] ?? 0) > Math.abs(a[pivot]?.[col] ?? 0)) pivot = row;
    }
    const pivotRow = a[pivot];
    const current = a[col];
    if (!pivotRow || !current || Math.abs(pivotRow[col] ?? 0) < 1e-12) return null;
    a[pivot] = current;
    a[col] = pivotRow;
    for (let row = 0; row < n; row += 1) {
      const target = a[row];
      if (row === col || !target) continue;
      const factor = (target[col] ?? 0) / (pivotRow[col] ?? 1);
      for (let k = col; k <= n; k += 1) target[k] = (target[k] ?? 0) - factor * (pivotRow[k] ?? 0);
    }
  }
  return a.map((row, i) => (row[n] ?? 0) / (row[i] ?? 1));
};

const rSquared = (points: readonly Point[], predict: (x: number) => number) => {
  const mean = sum(points.map(([, y]) => y)) / points.length;
  const total = sum(points.map(([, y]) => (y - mean) ** 2));
  const residual = sum(points.map(([x, y]) => (y - predict(x)) ** 2));
  return total === 0 ? (residual === 0 ? 1 : 0) : 1 - residual / total;
};

/** Modèle par moindres carrés ; null si les données ne le permettent pas. */
export const fitData = (points: readonly Point[], kind: FitKind): FitResult | null => {
  if (kind === 'none' || points.length < 2) return null;
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  let coefficients: number[] | null = null;
  let predict: (x: number) => number;
  switch (kind) {
    case 'linear': {
      const sxx = sum(xs.map((x) => x * x));
      if (sxx === 0) return null;
      const a = sum(points.map(([x, y]) => x * y)) / sxx;
      coefficients = [a];
      predict = (x) => a * x;
      break;
    }
    case 'affine': {
      const n = points.length;
      coefficients = solveLinearSystem(
        [
          [sum(xs.map((x) => x * x)), sum(xs)],
          [sum(xs), n],
        ],
        [sum(points.map(([x, y]) => x * y)), sum(ys)],
      );
      if (!coefficients) return null;
      const [a = 0, b = 0] = coefficients;
      predict = (x) => a * x + b;
      break;
    }
    case 'quadratic': {
      if (points.length < 3) return null;
      const power = (p: number) => sum(xs.map((x) => x ** p));
      coefficients = solveLinearSystem(
        [
          [power(4), power(3), power(2)],
          [power(3), power(2), power(1)],
          [power(2), power(1), points.length],
        ],
        [
          sum(points.map(([x, y]) => x * x * y)),
          sum(points.map(([x, y]) => x * y)),
          sum(ys),
        ],
      );
      if (!coefficients) return null;
      const [a = 0, b = 0, c = 0] = coefficients;
      predict = (x) => a * x * x + b * x + c;
      break;
    }
    case 'exponential': {
      // y = A·e^(kx) : droite ajustée sur ln(y) (toutes les valeurs doivent être positives).
      if (ys.some((y) => y <= 0)) return null;
      const logFit = fitData(
        points.map(([x, y]) => [x, Math.log(y)] as const),
        'affine',
      );
      if (!logFit) return null;
      const [k = 0, lnA = 0] = logFit.coefficients;
      const A = Math.exp(lnA);
      coefficients = [A, k];
      predict = (x) => A * Math.exp(k * x);
      break;
    }
  }
  return { kind, coefficients, r2: rSquared(points, predict), predict };
};

/** Nombre arrondi lisible (3 chiffres significatifs). */
export const formatNumber = (value: number, digits = 3): string => {
  if (!Number.isFinite(value)) return '?';
  if (value === 0) return '0';
  const rounded = Number(value.toPrecision(digits));
  return String(rounded);
};

const signed = (value: number) =>
  value < 0 ? ` - ${formatNumber(-value)}` : ` + ${formatNumber(value)}`;

/** Équation du modèle en LaTeX, ex. « y = 2.5x + 1.2 ». */
export const fitEquationLatex = (fit: FitResult): string => {
  const [p = 0, q = 0, r = 0] = fit.coefficients;
  switch (fit.kind) {
    case 'linear':
      return `y = ${formatNumber(p)}\\,x`;
    case 'affine':
      return `y = ${formatNumber(p)}\\,x${signed(q)}`;
    case 'quadratic':
      return `y = ${formatNumber(p)}\\,x^2${signed(q)}\\,x${signed(r)}`;
    case 'exponential':
      return `y = ${formatNumber(p)}\\,e^{${formatNumber(q)}\\,x}`;
  }
};
