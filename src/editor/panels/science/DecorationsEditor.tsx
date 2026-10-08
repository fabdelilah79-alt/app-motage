import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { randomId } from '../../../shared/factories';
import type { Plot2DElement, PlotDecoration, PlotDecorationKind } from '../../../shared/schema';
import { Button } from '../../ui/button';
import { DecorationItem } from './DecorationItem';
import { usePlotEdit } from './usePlotEdit';

const KINDS: readonly PlotDecorationKind[] = ['movingPoint', 'area', 'asymptote', 'point', 'annotation'];

/** Décoration par défaut, placée dans la fenêtre du repère. */
const newDecoration = (kind: PlotDecorationKind, plot: Plot2DElement): PlotDecoration => {
  const { xMin, xMax, yMin, yMax } = plot.axes;
  const seriesId = plot.series[0]?.id ?? '';
  const id = `deco-${randomId()}`;
  const color = 'theme.accent2';
  const midX = (xMin + xMax) / 2;
  const midY = (yMin + yMax) / 2;
  switch (kind) {
    case 'movingPoint':
      return { id, color, kind, seriesId, from: xMin + (xMax - xMin) * 0.1, to: xMax - (xMax - xMin) * 0.1, start: 30, duration: 90, easing: 'linear', showCoords: true, guides: true, tangent: false };
    case 'area':
      return { id, color: 'theme.accent3', kind, seriesId, from: Math.max(xMin, 0), to: midX, start: 30, duration: 60, opacity: 0.35 };
    case 'asymptote':
      return { id, color: 'theme.muted', kind, orientation: 'horizontal', value: midY, label: '' };
    case 'point':
      return { id, color, kind, x: midX, y: midY, label: 'A', guides: true };
    case 'annotation':
      return { id, color: 'theme.text', kind, x: midX, y: yMax - (yMax - yMin) * 0.1, text: '…' };
  }
};

/** Point mobile (et tangente), aire sous la courbe, asymptote, point, annotation. */
export const DecorationsEditor = ({ element, fps }: { element: Plot2DElement; fps: number }) => {
  const { t } = useTranslation();
  const edit = usePlotEdit(element.id);
  const hasSeries = element.series.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('science.decorations')}</p>
      {element.decorations.map((decoration, index) => (
        <DecorationItem
          key={decoration.id}
          decoration={decoration}
          series={element.series}
          fps={fps}
          onChange={(recipe) =>
            edit((plot) => {
              const current = plot.decorations[index];
              if (current) recipe(current);
            })
          }
          onRemove={() => edit((plot) => void plot.decorations.splice(index, 1))}
        />
      ))}
      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((kind) => (
          <Button
            key={kind}
            size="sm"
            data-testid={`add-decoration-${kind}`}
            disabled={(kind === 'movingPoint' || kind === 'area') && !hasSeries}
            onClick={() => edit((plot) => void plot.decorations.push(newDecoration(kind, plot)))}
          >
            <Plus size={14} aria-hidden />
            {t(`science.decorationKinds.${kind}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
