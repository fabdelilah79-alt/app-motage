import type { FC } from 'react';
import type { Axes3D } from '../../shared/schema';
import { Arrow3D } from './Arrow3D';

type Props = { axes: Axes3D; colors: [string, string, string]; gridColor: string };

/** Repère 3D : trois axes fléchés et quadrillage horizontal (plan x, y). */
export const Axes3DView: FC<Props> = ({ axes, colors, gridColor }) => {
  if (!axes.show) return null;
  const s = axes.size;
  const r = s * 0.012;
  return (
    <>
      <Arrow3D from={[-s, 0, 0]} to={[s * 1.1, 0, 0]} radius={r} color={colors[0]} />
      <Arrow3D from={[0, -s, 0]} to={[0, s * 1.1, 0]} radius={r} color={colors[1]} />
      <Arrow3D from={[0, 0, -s * 0.2]} to={[0, 0, s * 1.1]} radius={r} color={colors[2]} />
      {axes.grid ? (
        <gridHelper args={[s * 2, Math.round(s * 2), gridColor, gridColor]} />
      ) : null}
    </>
  );
};
