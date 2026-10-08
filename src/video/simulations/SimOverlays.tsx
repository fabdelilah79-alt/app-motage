import type { FC } from 'react';
import type { Lang } from '../../shared/schema';
import type { Quantity, SimResult } from '../../shared/simulations/types';
import { InlineMath } from '../science/InlineMath';
import { formatPlotNumber } from '../science/plot/scales';
import { valueAt } from './types';

/** Valeurs numériques des grandeurs à l'instant courant (temps compris). */
export const SimValues: FC<{ result: SimResult; quantities: readonly Quantity[]; index: number; color: string; fontSize: number; lang: Lang }> = ({
  result,
  quantities,
  index,
  color,
  fontSize,
  lang,
}) => (
  <div dir="ltr" style={{ display: 'flex', flexDirection: 'column', gap: fontSize * 0.2, color, fontSize, unicodeBidi: 'isolate' }}>
    {[{ key: 't', symbol: 't', unit: 's' }, ...quantities.slice(0, 3)].map((quantity) => {
      const value = valueAt(result, quantity.key, index);
      const shown = Number.isFinite(value) ? formatPlotNumber(value, lang, false, 3) : '—';
      return (
        <div key={quantity.key} style={{ whiteSpace: 'nowrap' }}>
          <InlineMath latex={`${quantity.symbol} = `} color={color} />
          <span style={{ fontWeight: 700 }}>{` ${shown}${quantity.unit ? ` ${quantity.unit}` : ''}`}</span>
        </div>
      );
    })}
  </div>
);

/** Énergies cinétique, potentielle et mécanique en barres animées. */
export const EnergyBars: FC<{ result: SimResult; index: number; colors: [string, string, string]; textColor: string; fontSize: number }> = ({
  result,
  index,
  colors,
  textColor,
  fontSize,
}) => {
  const keys = ['ec', 'ep', 'em'] as const;
  const labels = ['Ec', 'Ep', 'Em'];
  const max = Math.max(1e-9, ...(result.em ?? []), ...(result.ec ?? []), ...(result.ep ?? []));
  const barHeight = fontSize * 5;
  return (
    <svg width={fontSize * 6} height={barHeight + fontSize * 1.6}>
      {keys.map((key, k) => {
        const h = (Math.max(0, valueAt(result, key, index)) / max) * barHeight;
        return (
          <g key={key}>
            <rect x={k * fontSize * 2} y={barHeight - h} width={fontSize * 1.4} height={h} fill={colors[k]} rx={3} />
            <text x={k * fontSize * 2 + fontSize * 0.7} y={barHeight + fontSize * 1.2} textAnchor="middle" fill={textColor} fontSize={fontSize * 0.8} fontWeight={700}>
              {labels[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
