import { useMemo, type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { z } from 'zod';
import type { Plot2DElement, PlotDecoration } from '../../../shared/schema';
import { fitData, fitEquationLatex } from '../../../shared/science/fit';
import type { AnimationFrame } from '../../animations/types';
import { useProjectSettings } from '../../ProjectSettingsContext';
import { fontStackFor } from '../../text/fontStack';
import { useTheme } from '../../themes/ThemeContext';
import { InlineMath } from '../InlineMath';
import { progressAt, scopeAt } from './animatable';
import { parameterSpan, pointFunction, seriesPolylines } from './geometry';
import { PlotAxes } from './PlotAxes';
import { PlotDecorationView } from './PlotDecorationView';
import { PlotSeriesView } from './PlotSeriesView';
import { formatPlotNumber, plotFrame } from './scales';

const scopesSchema = z.array(z.record(z.string(), z.number()));

/**
 * Repère 2D : courbes pré-calculées et mémorisées (recalculées seulement quand un paramètre
 * animé change), puis lues à la frame courante (tracé progressif, point mobile, aire…).
 */
export const Plot2DElementView: FC<{ element: Plot2DElement; animation: AnimationFrame }> = ({
  element,
}) => {
  const time = useCurrentFrame();
  const theme = useTheme();
  const { defaultLang, digits } = useProjectSettings();
  const { axes, series, decorations } = element;
  const { width, height } = element.transform;
  const frame = useMemo(() => plotFrame(axes, width, height), [axes, width, height]);
  const fontFamily = fontStackFor({}, defaultLang, theme.fonts);
  const arabicDigits = defaultLang === 'ar' && digits === 'arabic-indic';
  const format = (value: number) => formatPlotNumber(value, defaultLang, arabicDigits);

  // Clé des valeurs des paramètres à cette frame : identique tant que rien n'est animé.
  const scopeKey = JSON.stringify(series.map((item) => scopeAt(item.params, time)));
  const computed = useMemo(() => {
    const scopes = scopesSchema.parse(JSON.parse(scopeKey));
    return series.map((item, index) => {
      const scope = scopes[index] ?? {};
      return {
        series: item,
        lines: seriesPolylines(item, axes, scope),
        point: pointFunction(item, scope),
        span: parameterSpan(item, axes),
      };
    });
  }, [series, axes, scopeKey]);

  const targetOf = (decoration: PlotDecoration) =>
    'seriesId' in decoration
      ? computed.find((item) => item.series.id === decoration.seriesId)
      : undefined;

  const equations = computed.flatMap(({ series: item }) => {
    if (item.kind !== 'data' || !item.showEquation) return [];
    if (progressAt(time, item.drawStart, item.drawDuration) < 1) return [];
    const fit = fitData(item.points, item.fit);
    return fit ? [{ id: item.id, latex: fitEquationLatex(fit), color: item.color }] : [];
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          <clipPath id={`plot-clip-${element.id}`}>
            <rect x={frame.left} y={frame.top} width={frame.width} height={frame.height} />
          </clipPath>
        </defs>
        <PlotAxes axes={axes} frame={frame} fontFamily={fontFamily} format={format} />
        <g clipPath={`url(#plot-clip-${element.id})`}>
          {decorations
            .filter((decoration) => decoration.kind === 'area')
            .map((decoration) => (
              <PlotDecorationView
                key={decoration.id}
                decoration={decoration}
                target={targetOf(decoration)}
                frame={frame}
                time={time}
                fontFamily={fontFamily}
                fontSize={axes.fontSize}
                format={format}
                window={axes}
              />
            ))}
          {computed.map((item) => (
            <PlotSeriesView
              key={item.series.id}
              series={item.series}
              lines={item.lines}
              progress={progressAt(time, item.series.drawStart, item.series.drawDuration)}
              frame={frame}
              fontFamily={fontFamily}
              fontSize={axes.fontSize}
            />
          ))}
        </g>
        {decorations
          .filter((decoration) => decoration.kind !== 'area')
          .map((decoration) => (
            <PlotDecorationView
              key={decoration.id}
              decoration={decoration}
              target={targetOf(decoration)}
              frame={frame}
              time={time}
              fontFamily={fontFamily}
              fontSize={axes.fontSize}
              format={format}
              window={axes}
            />
          ))}
      </svg>
      {equations.map((equation, index) => (
        <div
          key={equation.id}
          style={{
            position: 'absolute',
            right: width - frame.left - frame.width + axes.fontSize * 0.5,
            top: frame.top + axes.fontSize * (0.3 + index * 1.8),
            fontSize: axes.fontSize,
          }}
        >
          <InlineMath latex={equation.latex} color={equation.color} />
        </div>
      ))}
    </div>
  );
};
