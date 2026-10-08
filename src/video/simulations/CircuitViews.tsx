import type { FC } from 'react';
import { VectorArrow } from './draw';
import { valueAt, type SimColors, type SimView } from './types';

type Box = { left: number; right: number; top: number; bottom: number };

/** Boucle du circuit : générateur ou condensateur chargé à gauche, composants en haut / à droite. */
const Loop: FC<{ box: Box; colors: SimColors; withInductor: boolean; withSource: boolean; fill: number; positive: boolean }> = ({
  box,
  colors,
  withInductor,
  withSource,
  fill,
  positive,
}) => {
  const { left, right, top, bottom } = box;
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;
  const plate = (bottom - top) * 0.18;
  const capX = right;
  const level = Math.max(0, Math.min(1, Math.abs(fill)));
  return (
    <g stroke={colors.text} strokeWidth={3} fill="none">
      <path d={`M${left} ${top} H${midX - 60} M${midX + 60} ${top} H${right} V${midY - 10} M${right} ${midY + 10} V${bottom} H${left} V${top}`} />
      {/* Résistance (rectangle) en haut. */}
      <rect x={midX - 60} y={top - 16} width={120} height={32} fill={colors.surface} />
      <text x={midX} y={top + 6} textAnchor="middle" fill={colors.text} stroke="none" fontSize={22}>R</text>
      {/* Condensateur à droite : plaques + niveau de charge. */}
      <g>
        <line x1={capX - plate} x2={capX + plate} y1={midY - 10} y2={midY - 10} strokeWidth={5} />
        <line x1={capX - plate} x2={capX + plate} y1={midY + 10} y2={midY + 10} strokeWidth={5} />
        <rect x={capX + plate + 14} y={midY - 40} width={14} height={80} stroke={colors.muted} strokeWidth={2} />
        <rect x={capX + plate + 14} y={midY + 40 - 80 * level} width={14} height={80 * level} fill={colors.accent} stroke="none" />
        <text x={capX - plate - 14} y={midY - 18} textAnchor="end" fill={positive ? colors.vectors.force : colors.vectors.velocity} stroke="none" fontSize={24} fontWeight={700}>{positive ? '+' : '−'}</text>
        <text x={capX - plate - 14} y={midY + 34} textAnchor="end" fill={positive ? colors.vectors.velocity : colors.vectors.force} stroke="none" fontSize={24} fontWeight={700}>{positive ? '−' : '+'}</text>
      </g>
      {withSource ? (
        <g>
          <line x1={left - 18} x2={left + 18} y1={midY - 8} y2={midY - 8} strokeWidth={4} />
          <line x1={left - 9} x2={left + 9} y1={midY + 8} y2={midY + 8} strokeWidth={6} />
          <text x={left - 28} y={midY} textAnchor="end" fill={colors.text} stroke="none" fontSize={24}>E</text>
        </g>
      ) : null}
      {withInductor ? (
        <path d={`M${midX - 50} ${bottom} a12 12 0 0 1 25 0 a12 12 0 0 1 25 0 a12 12 0 0 1 25 0 a12 12 0 0 1 25 0`} fill={colors.surface} />
      ) : null}
    </g>
  );
};

const box = (width: number, height: number): Box => ({
  left: width * 0.15,
  right: width * 0.75,
  top: height * 0.2,
  bottom: height * 0.8,
});

/** Circuit RC : le condensateur se charge (ou se décharge), courant fléché. */
export const RCView: SimView = ({ result, index, p, width, height, colors }) => {
  const b = box(width, height);
  const E = p('E');
  const i = valueAt(result, 'i', index);
  const iMax = Math.max(1e-9, ...(result.i ?? []).map(Math.abs));
  const arrow = (i / iMax) * (b.right - b.left) * 0.25;
  return (
    <svg width={width} height={height}>
      <Loop box={b} colors={colors} withInductor={false} withSource={p('discharge') < 0.5} fill={valueAt(result, 'uC', index) / E} positive />
      <VectorArrow from={{ x: b.left + 20, y: b.top - 34 }} to={{ x: b.left + 20 + arrow, y: b.top - 34 }} color={colors.vectors.velocity} label="i" />
    </svg>
  );
};

/** Circuit RLC : la tension du condensateur oscille et s'amortit ; les charges s'inversent. */
export const RLCView: SimView = ({ result, index, p, width, height, colors }) => {
  const b = box(width, height);
  const uC = valueAt(result, 'uC', index);
  const i = valueAt(result, 'i', index);
  const iMax = Math.max(1e-9, ...(result.i ?? []).map(Math.abs));
  const arrow = (i / iMax) * (b.right - b.left) * 0.25;
  return (
    <svg width={width} height={height}>
      <Loop box={b} colors={colors} withInductor withSource={false} fill={uC / p('U0')} positive={uC >= 0} />
      <VectorArrow from={{ x: b.left + 20, y: b.top - 34 }} to={{ x: b.left + 20 + arrow, y: b.top - 34 }} color={colors.vectors.velocity} label="i" />
    </svg>
  );
};
