import { random } from 'remotion';
import { valueAt, type SimView } from './types';

/**
 * Décroissance radioactive : chaque noyau se désintègre à son propre instant, tiré une fois
 * pour toutes avec `random(graine)` (loi exponentielle) → rendu identique à chaque export.
 */
export const DecayView: SimView = ({ result, index, p, width, height, colors }) => {
  const N0 = Math.round(p('N0'));
  const lambda = Math.LN2 / p('halfLife');
  const t = valueAt(result, 't', index);
  const columns = Math.ceil(Math.sqrt((N0 * width) / height));
  const rows = Math.ceil(N0 / columns);
  const cell = Math.min(width / columns, height / rows);
  const offsetX = (width - columns * cell) / 2;
  const offsetY = (height - rows * cell) / 2;
  return (
    <svg width={width} height={height}>
      {Array.from({ length: N0 }, (_, k) => {
        const decayTime = -Math.log(1 - random(`noyau-${k}`)) / lambda;
        const decayed = t >= decayTime;
        return (
          <circle
            key={k}
            cx={offsetX + (k % columns + 0.5) * cell}
            cy={offsetY + (Math.floor(k / columns) + 0.5) * cell}
            r={cell * 0.36}
            fill={decayed ? colors.muted : colors.main}
            opacity={decayed ? 0.35 : 1}
          />
        );
      })}
    </svg>
  );
};
