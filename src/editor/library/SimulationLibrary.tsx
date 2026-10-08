import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '../../shared/schema';
import { createSimulationElement } from '../../shared/simulationFactories';
import { SIM_CATEGORIES, SIMULATIONS } from '../../shared/simulations/registry';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

/** Simulations physiques prêtes à l'emploi, par domaine (★ = essentielles). */
export const SimulationLibrary = () => {
  const { t, i18n } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const duration = scene?.durationInFrames ?? project.format.fps * 5;
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';

  return (
    <div className="flex flex-col gap-3">
      {SIM_CATEGORIES.map((category) => {
        const models = SIMULATIONS.filter((model) => model.category === category);
        if (models.length === 0) return null;
        return (
          <section key={category} className="flex flex-col gap-1.5">
            <h3 className="text-xs font-semibold text-slate-300">{t(`simulation.categories.${category}`)}</h3>
            {models.map((model) => (
              <button
                key={model.id}
                type="button"
                data-testid={`add-simulation-${model.id}`}
                onClick={() => addElement(createSimulationElement(project.format, duration, model))}
                className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-start text-xs text-slate-200 hover:border-sky-400"
              >
                {model.star ? <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" aria-label={t('simulation.essential')} /> : <span className="w-3" />}
                {model.name[lang]}
              </button>
            ))}
          </section>
        );
      })}
    </div>
  );
};
