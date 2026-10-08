import { toRadians } from '../../shared/simulations/params';
import { valueAt, type SimView } from './types';

/** Réfraction : rayons incident, réfléchi et réfracté ; réflexion totale si pas de réfraction. */
export const RefractionView: SimView = ({ result, index, p, width, height, colors, fontSize }) => {
  const o = { x: width / 2, y: height / 2 };
  const L = Math.min(width, height) * 0.42;
  const i = toRadians(valueAt(result, 'i', index));
  const rDeg = valueAt(result, 'r', index);
  const total = Number.isNaN(rDeg);
  const r = toRadians(total ? 0 : rDeg);
  const incident = { x: o.x - L * Math.sin(i), y: o.y - L * Math.cos(i) };
  const reflected = { x: o.x + L * Math.sin(i), y: o.y - L * Math.cos(i) };
  const refracted = { x: o.x + L * Math.sin(r), y: o.y + L * Math.cos(r) };
  const arc = (from: number, to: number, radius: number, below: boolean) => {
    const sign = below ? 1 : -1;
    const start = { x: o.x + radius * Math.sin(from), y: o.y + sign * radius * Math.cos(from) };
    const end = { x: o.x + radius * Math.sin(to), y: o.y + sign * radius * Math.cos(to) };
    return `M${start.x} ${start.y} A${radius} ${radius} 0 0 ${below ? 0 : 1} ${end.x} ${end.y}`;
  };
  const text = { fontSize: fontSize * 0.8, fontWeight: 700 };
  return (
    <svg width={width} height={height}>
      <rect x={0} y={o.y} width={width} height={height - o.y} fill={colors.accent} opacity={0.12} />
      <line x1={0} x2={width} y1={o.y} y2={o.y} stroke={colors.text} strokeWidth={3} />
      <line x1={o.x} x2={o.x} y1={o.y - L * 1.1} y2={o.y + L * 1.1} stroke={colors.muted} strokeDasharray="8 6" />
      <text x={16} y={o.y - 16} fill={colors.text} {...text}>{`n₁ = ${p('n1')}`}</text>
      <text x={16} y={o.y + fontSize + 6} fill={colors.text} {...text}>{`n₂ = ${p('n2')}`}</text>
      <line x1={incident.x} y1={incident.y} x2={o.x} y2={o.y} stroke={colors.main} strokeWidth={5} />
      <line x1={o.x} y1={o.y} x2={reflected.x} y2={reflected.y} stroke={colors.main} strokeWidth={total ? 5 : 2} opacity={total ? 1 : 0.4} />
      {total ? null : <line x1={o.x} y1={o.y} x2={refracted.x} y2={refracted.y} stroke={colors.main} strokeWidth={5} />}
      <path d={arc(-i, 0, L * 0.25, false)} fill="none" stroke={colors.accent} strokeWidth={2} />
      <text x={o.x - L * 0.18} y={o.y - L * 0.32} fill={colors.accent} {...text}>i₁</text>
      {total ? (
        <text x={o.x} y={o.y + L * 0.5} textAnchor="middle" fill={colors.vectors.force} {...text}>✕</text>
      ) : (
        <>
          <path d={arc(0, r, L * 0.25, true)} fill="none" stroke={colors.accent} strokeWidth={2} />
          <text x={o.x + L * 0.12} y={o.y + L * 0.4} fill={colors.accent} {...text}>i₂</text>
        </>
      )}
    </svg>
  );
};
