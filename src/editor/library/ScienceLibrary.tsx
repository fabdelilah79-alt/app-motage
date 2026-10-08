import { BarChart3, MoveUpRight, PieChart, Ruler, Sigma, Spline, Table2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { calloutKindSchema, type Lang, type SceneElement } from '../../shared/schema';
import {
  createCalloutElement,
  createChartElement,
  createDimensionElement,
  createMathElement,
  createPlotElement,
  createVectorElement,
} from '../../shared/scienceFactories';
import { CALLOUT_STYLES } from '../../video/science/calloutStyles';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { DiagramLibrary } from './DiagramLibrary';

const TILE =
  'flex flex-col items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-2 ' +
  'text-center text-[10px] text-slate-300 hover:border-sky-400';

/** Module Sciences : équations, repères et courbes, graphiques, vecteurs, encadrés, schémas. */
export const ScienceLibrary = () => {
  const { t, i18n } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const duration = scene?.durationInFrames ?? project.format.fps * 5;
  const { format } = project;
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';

  const tile = (id: string, icon: ReactNode, label: string, create: () => SceneElement) => (
    <button key={id} type="button" data-testid={`add-${id}`} className={TILE} onClick={() => addElement(create())}>
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-slate-300">{t('science.mathAndPlots')}</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {tile('math', <Sigma size={20} aria-hidden />, t('elementTypes.math'), () =>
          createMathElement(format, duration),
        )}
        {tile('plot-function', <Spline size={20} aria-hidden />, t('science.plotFunction'), () =>
          createPlotElement(format, duration, 'function'),
        )}
        {tile('plot-data', <Table2 size={20} aria-hidden />, t('science.plotData'), () =>
          createPlotElement(format, duration, 'data'),
        )}
        {tile('chart-bar', <BarChart3 size={20} aria-hidden />, t('science.chartKinds.bar'), () =>
          createChartElement(format, duration, 'bar'),
        )}
        {tile('chart-pie', <PieChart size={20} aria-hidden />, t('science.chartKinds.pie'), () =>
          createChartElement(format, duration, 'pie'),
        )}
        {tile('chart-histogram', <BarChart3 size={20} aria-hidden />, t('science.chartKinds.histogram'), () =>
          createChartElement(format, duration, 'histogram'),
        )}
        {tile('vector', <MoveUpRight size={20} aria-hidden />, t('elementTypes.vector'), () =>
          createVectorElement(format, duration),
        )}
        {tile('dimension', <Ruler size={20} aria-hidden />, t('elementTypes.dimension'), () =>
          createDimensionElement(format, duration, project.defaultLang),
        )}
      </div>
      <h3 className="text-xs font-semibold text-slate-300">{t('science.callouts')}</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {calloutKindSchema.options.map((kind) => {
          const { Icon, color } = CALLOUT_STYLES[kind];
          return tile(
            `callout-${kind}`,
            <Icon size={20} color={color} aria-hidden />,
            CALLOUT_STYLES[kind].title[lang],
            () => createCalloutElement(format, duration, kind, project.defaultLang),
          );
        })}
      </div>
      <DiagramLibrary />
    </div>
  );
};
