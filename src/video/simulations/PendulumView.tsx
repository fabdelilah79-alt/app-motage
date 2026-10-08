import { toRadians } from '../../shared/simulations/params';
import { TrajectoryPath, VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Pendule : fil, masse, arc parcouru, vitesse, poids et tension. */
export const PendulumView: SimView = ({ result, index, p, display, width, height, colors }) => {
  const pivot = { x: width / 2, y: height * 0.08 };
  const length = Math.min(height * 0.75, width * 0.45);
  const theta = toRadians(valueAt(result, 'theta', index));
  const bob = { x: pivot.x + length * Math.sin(theta), y: pivot.y + length * Math.cos(theta) };
  const r = Math.max(10, length * 0.07);
  const omega = valueAt(result, 'omega', index);
  const omegaMax = Math.max(1e-6, ...(result.omega ?? []).map(Math.abs));
  const amplitude = toRadians(Math.max(...(result.theta ?? [0]).map(Math.abs)));
  const arc = Array.from({ length: 41 }, (_, k) => {
    const a = -amplitude + (2 * amplitude * k) / 40;
    return { x: pivot.x + length * Math.sin(a), y: pivot.y + length * Math.cos(a) };
  });
  const show = (key: string) => display.vectors.includes(key);
  // Vitesse tangente au cercle ; tension vers le point d'attache (m·g·cosθ + m·v²/L).
  const vLen = (omega / omegaMax) * length * 0.35;
  const tension = Math.cos(theta) + (p('L') * omega * omega) / p('g');
  return (
    <svg width={width} height={height}>
      <line x1={pivot.x - 60} x2={pivot.x + 60} y1={pivot.y} y2={pivot.y} stroke={colors.text} strokeWidth={4} />
      {display.trajectory ? <TrajectoryPath points={arc} color={colors.muted} /> : null}
      <line x1={pivot.x} y1={pivot.y} x2={pivot.x} y2={pivot.y + length * 1.05} stroke={colors.muted} strokeDasharray="6 6" />
      <line x1={pivot.x} y1={pivot.y} x2={bob.x} y2={bob.y} stroke={colors.text} strokeWidth={3} />
      <circle cx={pivot.x} cy={pivot.y} r={5} fill={colors.text} />
      <circle cx={bob.x} cy={bob.y} r={r} fill={colors.main} />
      {show('velocity') ? (
        <VectorArrow from={bob} to={{ x: bob.x + vLen * Math.cos(theta), y: bob.y - vLen * Math.sin(theta) }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {show('weight') ? <VectorArrow from={bob} to={{ x: bob.x, y: bob.y + length * 0.25 }} color={colors.vectors.force} label="P" /> : null}
      {show('tension') ? (
        <VectorArrow
          from={bob}
          to={{ x: bob.x - Math.sin(theta) * length * 0.25 * tension, y: bob.y - Math.cos(theta) * length * 0.25 * tension }}
          color={colors.vectors.acceleration}
          label="T"
        />
      ) : null}
    </svg>
  );
};
