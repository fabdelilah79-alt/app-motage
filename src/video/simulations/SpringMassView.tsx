import { VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Masse-ressort horizontal : ressort qui s'étire, position d'équilibre, vitesse et force. */
export const SpringMassView: SimView = ({ result, index, p, display, width, height, colors }) => {
  const wall = width * 0.08;
  const rest = width * 0.5;
  const amplitude = Math.max(1e-6, Math.abs(p('x0')), ...(result.x ?? []).map(Math.abs));
  const scale = (width * 0.25) / amplitude;
  const x = valueAt(result, 'x', index);
  const block = { w: Math.min(width, height) * 0.18, h: Math.min(width, height) * 0.18 };
  const left = rest + x * scale - block.w / 2;
  const y = height * 0.55;
  const coils = 12;
  const springEnd = left;
  const step = (springEnd - wall) / (coils * 2);
  let spring = `M${wall} ${y}`;
  for (let k = 1; k <= coils * 2; k += 1) spring += ` L${wall + step * k} ${y + (k % 2 === 0 ? 0 : k % 4 === 1 ? -18 : 18)}`;
  const v = valueAt(result, 'v', index);
  const vMax = Math.max(1e-6, ...(result.v ?? []).map(Math.abs));
  const center = { x: left + block.w / 2, y: y - block.h * 0.8 };
  const show = (key: string) => display.vectors.includes(key);
  return (
    <svg width={width} height={height}>
      <rect x={wall - 16} y={y - block.h} width={16} height={block.h * 1.6} fill={colors.muted} />
      <line x1={wall} x2={width * 0.95} y1={y + block.h / 2} y2={y + block.h / 2} stroke={colors.text} strokeWidth={3} />
      <line x1={rest} x2={rest} y1={y - block.h} y2={y + block.h / 2} stroke={colors.muted} strokeDasharray="6 6" />
      <text x={rest} y={y + block.h / 2 + 28} textAnchor="middle" fill={colors.muted} fontSize={22}>O</text>
      <path d={spring} fill="none" stroke={colors.text} strokeWidth={3} strokeLinejoin="round" />
      <rect x={left} y={y - block.h / 2} width={block.w} height={block.h} rx={6} fill={colors.main} />
      {show('velocity') ? (
        <VectorArrow from={center} to={{ x: center.x + (v / vMax) * width * 0.15, y: center.y }} color={colors.vectors.velocity} label="v" />
      ) : null}
      {show('force') ? (
        <VectorArrow from={{ x: center.x, y: y + block.h * 0.1 }} to={{ x: center.x - (x / amplitude) * width * 0.15, y: y + block.h * 0.1 }} color={colors.vectors.force} label="F" />
      ) : null}
    </svg>
  );
};
