import { Ground, TrajectoryPath, VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Chute libre : balle, chronophotographie (une position toutes les 4 images), vecteurs. */
export const FreeFallView: SimView = ({ result, index, p, display, width, height, colors }) => {
  const h0 = p('h0');
  const top = height * 0.08;
  const bottom = height * 0.9;
  const scale = (bottom - top) / Math.max(0.1, h0);
  const x = width / 2;
  const yOf = (i: number) => bottom - valueAt(result, 'y', i) * scale;
  const ballY = yOf(index);
  const vMax = Math.sqrt(2 * p('g') * h0) || 1;
  const v = valueAt(result, 'v', index);
  const r = Math.max(10, Math.min(width, height) * 0.035);
  const ghosts = Array.from({ length: Math.floor(index / 4) }, (_, k) => ({ x, y: yOf(k * 4) }));
  return (
    <svg width={width} height={height}>
      <Ground x0={width * 0.25} x1={width * 0.75} y={bottom + r} color={colors.text} />
      {display.trajectory ? (
        <>
          <TrajectoryPath points={[{ x, y: yOf(0) }, { x, y: ballY }]} color={colors.muted} />
          {ghosts.map((ghost, k) => (
            <circle key={k} cx={ghost.x} cy={ghost.y} r={r * 0.5} fill={colors.main} opacity={0.3} />
          ))}
        </>
      ) : null}
      <circle cx={x} cy={ballY} r={r} fill={colors.main} />
      {display.vectors.includes('velocity') ? (
        <VectorArrow from={{ x: x + r * 1.6, y: ballY }} to={{ x: x + r * 1.6, y: ballY + (v / vMax) * height * 0.3 }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {display.vectors.includes('weight') ? (
        <VectorArrow from={{ x: x - r * 1.6, y: ballY }} to={{ x: x - r * 1.6, y: ballY + height * 0.15 }} color={colors.vectors.force} label="P" />
      ) : null}
    </svg>
  );
};
