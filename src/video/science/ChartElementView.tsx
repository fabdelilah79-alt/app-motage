import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';
import type { ChartElement } from '../../shared/schema';
import { EASINGS } from '../animations/easings';
import type { AnimationFrame } from '../animations/types';
import { useProjectSettings } from '../ProjectSettingsContext';
import { fontStackFor } from '../text/fontStack';
import { useTheme } from '../themes/ThemeContext';
import { histogramBins, pieSlices, slicePath, staggeredProgress } from './chartLayout';
import { formatPlotNumber } from './plot/scales';

/** Graphique de données : barres qui poussent, secteurs qui se déploient, histogramme. */
export const ChartElementView: FC<{ element: ChartElement; animation: AnimationFrame }> = ({
  element,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { defaultLang, digits } = useProjectSettings();
  const { width, height } = element.transform;
  const fontFamily = fontStackFor({}, defaultLang, theme.fonts);
  const f = element.fontSize;
  const items =
    element.chartKind === 'histogram' ? histogramBins(element.values, element.bins) : element.items;
  const palette = [theme.palette.accent1, theme.palette.accent2, theme.palette.accent3];
  const colorOf = (index: number) =>
    items[index]?.color ?? (element.chartKind === 'histogram' ? palette[0] : palette[index % 3]);
  const format = (value: number) =>
    `${formatPlotNumber(value, defaultLang, defaultLang === 'ar' && digits === 'arabic-indic')}${element.unit ? ` ${element.unit}` : ''}`;
  const text = { fill: element.textColor, fontFamily, fontSize: f * 0.8 };
  // Les barres se lisent dans le sens de lecture : de droite à gauche en arabe.
  const rtl = defaultLang === 'ar';

  if (element.chartKind === 'pie') {
    const progress = EASINGS.smooth(Math.min(1, frame / Math.max(1, element.growDuration)));
    const slices = pieSlices(items.map((item) => item.value), progress);
    const r = Math.min(width * 0.32, height * 0.45);
    const cx = width * 0.35;
    const cy = height / 2;
    const sliceVisible = (index: number) => {
      const slice = slices[index];
      return slice !== undefined && slice.end > slice.start;
    };
    return (
      <svg width={width} height={height}>
        {slices.map((slice, index) => (
          <path key={index} d={slicePath(cx, cy, r, slice)} fill={colorOf(index)} stroke={theme.palette.background} strokeWidth={3} />
        ))}
        {items.map((item, index) => (
          <g key={`legend-${index}`} opacity={sliceVisible(index) ? 1 : 0.2}>
            <rect x={width * 0.72} y={height * 0.2 + index * f * 1.4 - f * 0.7} width={f * 0.8} height={f * 0.8} rx={f * 0.15} fill={colorOf(index)} />
            <text x={width * 0.72 + f * 1.2} y={height * 0.2 + index * f * 1.4} {...text} style={{ unicodeBidi: 'plaintext' }}>
              {element.showValues ? `${item.label} : ${format(item.value)}` : item.label}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  const progress = staggeredProgress(items.length, frame, element.growDuration, element.stagger);
  const max = Math.max(1e-9, ...items.map((item) => item.value));
  const left = f;
  const bottom = height - f * 2.2;
  const top = f * 1.4;
  const slot = (width - left * 2) / Math.max(1, items.length);
  const gap = element.chartKind === 'histogram' ? 0 : slot * 0.25;
  return (
    <svg width={width} height={height}>
      <line x1={left} x2={width - left} y1={bottom} y2={bottom} stroke={element.textColor} strokeWidth={Math.max(2, f / 10)} />
      {items.map((item, index) => {
        const slotIndex = rtl ? items.length - 1 - index : index;
        const x = left + slotIndex * slot + gap / 2;
        const full = ((bottom - top) * Math.max(0, item.value)) / max;
        const h = full * EASINGS.smooth(progress[index] ?? 0);
        return (
          <g key={index}>
            <rect x={x} y={bottom - h} width={slot - gap} height={h} fill={colorOf(index)} stroke={element.chartKind === 'histogram' ? theme.palette.background : undefined} />
            {element.showValues && (progress[index] ?? 0) > 0.95 ? (
              <text x={x + (slot - gap) / 2} y={bottom - h - f * 0.3} textAnchor="middle" {...text} fontWeight={700}>
                {format(item.value)}
              </text>
            ) : null}
            <text x={x + (slot - gap) / 2} y={bottom + f * 1.1} textAnchor="middle" {...text} fontSize={f * (element.chartKind === 'histogram' ? 0.55 : 0.75)} style={{ unicodeBidi: 'plaintext' }}>
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
