import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { randomId } from '../../../shared/factories';
import type { Plot2DElement, Series2D, SeriesKind } from '../../../shared/schema';
import { Button } from '../../ui/button';
import { SeriesItem } from './SeriesItem';
import { usePlotEdit } from './usePlotEdit';

const KINDS: readonly SeriesKind[] = ['function', 'parametric', 'polar', 'data'];

/** Nouvelle courbe d'un type donné, apparaissant après les précédentes. */
const newSeries = (kind: SeriesKind, drawStart: number): Series2D => {
  const common = {
    id: `serie-${randomId()}`,
    color: 'theme.accent2',
    width: 5,
    dashed: false,
    label: '',
    drawStart,
    drawDuration: 45,
    params: {},
  };
  switch (kind) {
    case 'function':
      return { ...common, kind, expr: 'sin(x)' };
    case 'parametric':
      return { ...common, kind, x: '3*cos(t)', y: '3*sin(t)', tMin: 0, tMax: 2 * Math.PI };
    case 'polar':
      return { ...common, kind, r: '2+cos(3*θ)', thetaMin: 0, thetaMax: 2 * Math.PI };
    case 'data':
      return { ...common, kind, points: [], fit: 'none', showEquation: true, marker: 'circle' };
  }
};

/** Courbes du repère : plusieurs courbes peuvent apparaître l'une après l'autre. */
export const SeriesListEditor = ({ element, fps }: { element: Plot2DElement; fps: number }) => {
  const { t } = useTranslation();
  const edit = usePlotEdit(element.id);
  const last = element.series[element.series.length - 1];
  const nextStart = last ? last.drawStart + last.drawDuration : 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('science.series')}</p>
      {element.series.map((series, index) => (
        <SeriesItem
          key={series.id}
          series={series}
          fps={fps}
          onChange={(recipe) =>
            edit((plot) => {
              const current = plot.series[index];
              if (current) recipe(current);
            })
          }
          onRemove={() =>
            edit((plot) => {
              plot.series.splice(index, 1);
              plot.decorations = plot.decorations.filter(
                (decoration) => !('seriesId' in decoration) || decoration.seriesId !== series.id,
              );
            })
          }
        />
      ))}
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((kind) => (
          <Button key={kind} size="sm" data-testid={`add-series-${kind}`} onClick={() => edit((plot) => void plot.series.push(newSeries(kind, nextStart)))}>
            <Plus size={14} aria-hidden />
            {t(`science.seriesKinds.${kind}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
