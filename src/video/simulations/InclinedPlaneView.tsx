import { toRadians } from '../../shared/simulations/params';
import { VectorArrow } from './draw';
import { valueAt, type SimView } from './types';

/** Bloc qui glisse sur un plan incliné : poids, réaction normale, frottement, vitesse. */
export const InclinedPlaneView: SimView = ({ result, index, p, display, width, height, colors }) => {
  const alpha = toRadians(p('alpha'));
  const margin = Math.min(width, height) * 0.08;
  const base = Math.min(width - margin * 2, (height - margin * 2) / Math.max(0.05, Math.tan(alpha)));
  const rise = base * Math.tan(alpha);
  const bottom = { x: margin + base, y: height - margin };
  const top = { x: margin, y: height - margin - rise };
  const progress = Math.min(1, valueAt(result, 's', index) / p('L'));
  const along = { x: Math.cos(alpha), y: Math.sin(alpha) }; // vers le bas de la pente
  const normal = { x: Math.sin(alpha), y: -Math.cos(alpha) }; // perpendiculaire, vers le haut
  const size = Math.min(width, height) * 0.12;
  const slope = Math.hypot(bottom.x - top.x, bottom.y - top.y);
  const foot = { x: top.x + along.x * (size + (slope - size * 2) * progress), y: top.y + along.y * (size + (slope - size * 2) * progress) };
  const center = { x: foot.x + normal.x * size * 0.5, y: foot.y + normal.y * size * 0.5 };
  const corners = [
    [-0.5, 0],
    [0.5, 0],
    [0.5, 1],
    [-0.5, 1],
  ].map(([a = 0, b = 0]) => `${foot.x + along.x * size * a + normal.x * size * b},${foot.y + along.y * size * a + normal.y * size * b}`);
  const L = size * 1.6;
  const show = (key: string) => display.vectors.includes(key);
  const v = valueAt(result, 'v', index);
  const vMax = Math.max(1e-6, ...(result.v ?? []));
  return (
    <svg width={width} height={height}>
      <path d={`M${top.x} ${top.y} L${bottom.x} ${bottom.y} L${top.x} ${bottom.y} Z`} fill={colors.surface} stroke={colors.text} strokeWidth={3} />
      <polygon points={corners.join(' ')} fill={colors.main} />
      {show('weight') ? <VectorArrow from={center} to={{ x: center.x, y: center.y + L }} color={colors.vectors.force} label="P" /> : null}
      {show('normal') ? (
        <VectorArrow from={center} to={{ x: center.x + normal.x * L * Math.cos(alpha), y: center.y + normal.y * L * Math.cos(alpha) }} color={colors.vectors.acceleration} label="R" />
      ) : null}
      {show('friction') && p('mu') > 0 ? (
        <VectorArrow from={center} to={{ x: center.x - along.x * L * 0.5, y: center.y - along.y * L * 0.5 }} color={colors.muted} label="f" />
      ) : null}
      {show('velocity') ? (
        <VectorArrow from={center} to={{ x: center.x + along.x * L * (v / vMax), y: center.y + along.y * L * (v / vMax) }} color={colors.vectors.velocity} label="v" />
      ) : null}
    </svg>
  );
};
