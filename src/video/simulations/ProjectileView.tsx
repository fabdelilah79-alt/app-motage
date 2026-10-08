import { Ground, TrajectoryPath, VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Projectile : trajectoire parabolique, vitesse et ses composantes, poids. */
export const ProjectileView: SimView = ({ result, index, display, width, height, colors }) => {
  const xs = result.x ?? [];
  const ys = result.y ?? [];
  const xMax = Math.max(1, ...xs);
  const yMax = Math.max(1, ...ys);
  const margin = Math.min(width, height) * 0.08;
  const scale = Math.min((width - margin * 2) / xMax, (height - margin * 2) / yMax);
  const toPx = (i: number) => ({ x: margin + (xs[i] ?? 0) * scale, y: height - margin - (ys[i] ?? 0) * scale });
  const ball = toPx(index);
  const vx = valueAt(result, 'vx', index);
  const vy = valueAt(result, 'vy', index);
  const vScale = (height * 0.25) / Math.max(1e-6, Math.hypot(valueAt(result, 'vx', 0), valueAt(result, 'vy', 0)));
  const r = Math.max(8, Math.min(width, height) * 0.025);
  const path = Array.from({ length: index + 1 }, (_, i) => toPx(i));
  const show = (key: string) => display.vectors.includes(key);
  return (
    <svg width={width} height={height}>
      <Ground x0={margin * 0.5} x1={width - margin * 0.5} y={height - margin + r} color={colors.text} />
      {display.trajectory ? <TrajectoryPath points={path} color={colors.main} /> : null}
      <circle cx={ball.x} cy={ball.y} r={r} fill={colors.main} />
      {show('components') ? (
        <g opacity={0.8}>
          <VectorArrow from={ball} to={{ x: ball.x + vx * vScale, y: ball.y }} color={colors.muted} width={3} label="vₓ" />
          <VectorArrow from={ball} to={{ x: ball.x, y: ball.y - vy * vScale }} color={colors.muted} width={3} label="vᵧ" />
        </g>
      ) : null}
      {show('velocity') ? (
        <VectorArrow from={ball} to={{ x: ball.x + vx * vScale, y: ball.y - vy * vScale }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {show('weight') ? (
        <VectorArrow from={ball} to={{ x: ball.x, y: ball.y + height * 0.12 }} color={colors.vectors.force} label="P" />
      ) : null}
    </svg>
  );
};
