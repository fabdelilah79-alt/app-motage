import { ropeDisplacement } from '../../shared/simulations/others';
import { valueAt, type SimView } from './types';

/** Onde progressive : corde entière à l'instant t, source à gauche, point M repéré. */
export const WaveView: SimView = ({ result, index, p, width, height, colors, fontSize }) => {
  const [A, T, lambda, length, xM] = [p('A'), p('T'), p('lambda'), p('length'), p('xM')];
  const t = valueAt(result, 't', index);
  const margin = width * 0.06;
  const scaleX = (width - margin * 2) / length;
  const scaleY = (height * 0.35) / Math.max(1e-6, A);
  const mid = height / 2;
  const points = Array.from({ length: 301 }, (_, k) => {
    const x = (length * k) / 300;
    return `${k === 0 ? 'M' : 'L'}${(margin + x * scaleX).toFixed(1)} ${(mid - ropeDisplacement(x, t, A, T, lambda) * scaleY).toFixed(1)}`;
  });
  const m = { x: margin + Math.min(xM, length) * scaleX, y: mid - valueAt(result, 'yM', index) * scaleY };
  return (
    <svg width={width} height={height}>
      <line x1={margin} x2={width - margin} y1={mid} y2={mid} stroke={colors.muted} strokeDasharray="6 6" />
      <path d={points.join(' ')} fill="none" stroke={colors.main} strokeWidth={4} strokeLinejoin="round" />
      <rect x={margin - 14} y={mid - scaleY * A - 10} width={10} height={scaleY * A * 2 + 20} fill={colors.muted} rx={3} />
      <text x={margin - 9} y={mid + scaleY * A + 10 + fontSize} textAnchor="middle" fill={colors.text} fontSize={fontSize * 0.8}>S</text>
      <circle cx={m.x} cy={m.y} r={9} fill={colors.accent} />
      <text x={m.x} y={m.y - 16} textAnchor="middle" fill={colors.accent} fontSize={fontSize * 0.8} fontWeight={700}>M</text>
    </svg>
  );
};
