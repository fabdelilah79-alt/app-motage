import type { FC } from 'react';
import { arrowHead } from '../science/vectorGeometry';

type Point = { x: number; y: number };

/** Flèche de vecteur (tige + pointe), longueur en pixels ; rien si elle est trop courte. */
export const VectorArrow: FC<{ from: Point; to: Point; color: string; width?: number; label?: string; fontSize?: number }> = ({
  from,
  to,
  color,
  width = 4,
  label,
  fontSize = 24,
}) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < width * 2) return null;
  const head = Math.min(length * 0.4, width * 4);
  const ux = (to.x - from.x) / length;
  const uy = (to.y - from.y) / length;
  return (
    <g>
      <path
        d={`M${from.x} ${from.y} L${to.x - ux * head * 0.6} ${to.y - uy * head * 0.6}`}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path d={arrowHead(from, to, head)} fill={color} />
      {label ? (
        <text x={to.x + ux * fontSize * 0.6} y={to.y + uy * fontSize * 0.6 + fontSize * 0.35} fill={color} fontSize={fontSize} fontWeight={700} fontStyle="italic" textAnchor="middle">
          {label}
        </text>
      ) : null}
    </g>
  );
};

/** Trajectoire (pointillés) à partir d'une liste de points en pixels. */
export const TrajectoryPath: FC<{ points: readonly Point[]; color: string; width?: number }> = ({ points, color, width = 2 }) =>
  points.length > 1 ? (
    <path
      d={points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeDasharray={`${width * 3} ${width * 3}`}
      opacity={0.7}
    />
  ) : null;

/** Sol hachuré horizontal. */
export const Ground: FC<{ x0: number; x1: number; y: number; color: string }> = ({ x0, x1, y, color }) => {
  const hatches: string[] = [];
  for (let x = x0 + 12; x < x1; x += 18) hatches.push(`M${x} ${y} l-10 10`);
  return (
    <g stroke={color} strokeWidth={2}>
      <line x1={x0} x2={x1} y1={y} y2={y} strokeWidth={3} />
      <path d={hatches.join(' ')} />
    </g>
  );
};
