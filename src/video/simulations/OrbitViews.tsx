import { TrajectoryPath, VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Mouvement circulaire uniforme : vitesse tangente, accélération centripète. */
export const CircularMotionView: SimView = ({ result, index, p, display, width, height, colors }) => {
  const R = p('R');
  const radius = Math.min(width, height) * 0.36;
  const c = { x: width / 2, y: height / 2 };
  const scale = radius / R;
  const point = { x: c.x + valueAt(result, 'x', index) * scale, y: c.y - valueAt(result, 'y', index) * scale };
  const angle = Math.atan2(c.y - point.y, point.x - c.x);
  const L = radius * 0.5;
  return (
    <svg width={width} height={height}>
      {display.trajectory ? <circle cx={c.x} cy={c.y} r={radius} fill="none" stroke={colors.muted} strokeDasharray="8 8" strokeWidth={2} /> : null}
      <circle cx={c.x} cy={c.y} r={5} fill={colors.text} />
      <line x1={c.x} y1={c.y} x2={point.x} y2={point.y} stroke={colors.muted} strokeWidth={2} />
      <circle cx={point.x} cy={point.y} r={radius * 0.07} fill={colors.main} />
      {display.vectors.includes('velocity') ? (
        <VectorArrow from={point} to={{ x: point.x - Math.sin(angle) * L, y: point.y - Math.cos(angle) * L }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {display.vectors.includes('acceleration') ? (
        <VectorArrow from={point} to={{ x: point.x + (c.x - point.x) * 0.45, y: point.y + (c.y - point.y) * 0.45 }} color={colors.vectors.acceleration} label="a" />
      ) : null}
    </svg>
  );
};

/** Satellite : orbite (ellipse), vitesse plus grande près de la planète, force d'attraction. */
export const SatelliteView: SimView = ({ result, index, display, width, height, colors }) => {
  const xs = result.x ?? [];
  const ys = result.y ?? [];
  const extent = Math.max(1, ...xs.map(Math.abs), ...ys.map(Math.abs));
  const scale = (Math.min(width, height) * 0.45) / extent;
  const c = { x: width / 2, y: height / 2 };
  const toPx = (i: number) => ({ x: c.x + (xs[i] ?? 0) * scale, y: c.y - (ys[i] ?? 0) * scale });
  const sat = toPx(index);
  const next = toPx(Math.min(xs.length - 1, index + 1));
  const prev = toPx(Math.max(0, index - 1));
  const v = valueAt(result, 'v', index);
  const vMax = Math.max(1e-6, ...(result.v ?? []));
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const norm = Math.hypot(dx, dy) || 1;
  const L = Math.min(width, height) * 0.18;
  return (
    <svg width={width} height={height}>
      {display.trajectory ? <TrajectoryPath points={Array.from({ length: index + 1 }, (_, i) => toPx(i))} color={colors.muted} /> : null}
      <circle cx={c.x} cy={c.y} r={Math.min(width, height) * 0.07} fill="#3b82f6" />
      <circle cx={sat.x} cy={sat.y} r={Math.min(width, height) * 0.02} fill={colors.main} />
      {display.vectors.includes('velocity') ? (
        <VectorArrow from={sat} to={{ x: sat.x + (dx / norm) * L * (v / vMax), y: sat.y + (dy / norm) * L * (v / vMax) }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {display.vectors.includes('force') ? (
        <VectorArrow from={sat} to={{ x: sat.x + (c.x - sat.x) * 0.3, y: sat.y + (c.y - sat.y) * 0.3 }} color={colors.vectors.force} label="F" />
      ) : null}
    </svg>
  );
};
