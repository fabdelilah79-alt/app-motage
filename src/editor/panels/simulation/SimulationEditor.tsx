import { useTranslation } from 'react-i18next';
import type { Lang, SimulationElement } from '../../../shared/schema';
import { paramValue } from '../../../shared/simulations/params';
import { getSimulation } from '../../../shared/simulations/registry';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { useEditorStore } from '../../store/editorStore';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';

/** Réglages d'une simulation : paramètres (unités, bornes), affichage, graphique, ralenti, pause. */
export const SimulationEditor = ({ element, fps }: { element: SimulationElement; fps: number }) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const model = getSimulation(element.simId);
  if (!model) return null;
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';
  const edit = (recipe: (sim: SimulationElement) => void) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'simulation') recipe(draft);
    });
  const check = (checked: boolean, label: string, onChange: (value: boolean) => void, testId?: string) => (
    <label key={label} className="flex items-center gap-2 text-xs text-slate-300">
      <input type="checkbox" data-testid={testId} className="h-4 w-4 accent-sky-500" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-200">{model.name[lang]}</p>
      <div className="grid grid-cols-2 gap-2">
        {model.params.map((field) => (
          <Field key={field.key} label={`${field.name[lang]}${field.unit ? ` (${field.unit})` : ''}`}>
            <NumberInput
              data-testid={`sim-param-${field.key}`}
              min={field.min}
              max={field.max}
              step={field.step}
              value={paramValue(model.params, element.params, field.key)}
              onValueChange={(value) => edit((sim) => void (sim.params[field.key] = Math.min(field.max, Math.max(field.min, value))))}
            />
          </Field>
        ))}
      </div>
      <p className="text-xs font-semibold text-slate-300">{t('simulation.display')}</p>
      <div className="flex flex-wrap gap-3">
        {model.vectors.map((vector) =>
          check(element.display.vectors.includes(vector), t(`simulation.vectors.${vector}`), (on) =>
            edit((sim) => {
              sim.display.vectors = on ? [...sim.display.vectors, vector] : sim.display.vectors.filter((item) => item !== vector);
            }),
          ),
        )}
        {check(element.display.trajectory, t('simulation.trajectory'), (on) => edit((sim) => void (sim.display.trajectory = on)))}
        {check(element.display.values, t('simulation.values'), (on) => edit((sim) => void (sim.display.values = on)))}
        {model.quantities.some((quantity) => quantity.key === 'em')
          ? check(element.display.energyBars, t('simulation.energyBars'), (on) => edit((sim) => void (sim.display.energyBars = on)))
          : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('simulation.graph')}>
          <NativeSelect
            data-testid="sim-graph"
            value={element.graph.quantity}
            options={[{ value: '', label: t('simulation.noGraph') }, ...model.quantities.map((quantity) => ({ value: quantity.key, label: `${quantity.name[lang]}${quantity.unit ? ` (${quantity.unit})` : ''}` }))]}
            onChange={(event) => edit((sim) => void (sim.graph.quantity = event.target.value))}
          />
        </Field>
        <Field label={t('simulation.graphPosition')}>
          <NativeSelect
            value={element.graph.position}
            options={[
              { value: 'right', label: t('simulation.positions.right') },
              { value: 'below', label: t('simulation.positions.below') },
            ]}
            onChange={(event) => edit((sim) => void (sim.graph.position = event.target.value === 'below' ? 'below' : 'right'))}
          />
        </Field>
        <Field label={t('simulation.playbackRate')} hint={t('simulation.playbackRateHelp')}>
          <NumberInput min={0.05} max={20} step={0.05} value={element.playbackRate} onValueChange={(rate) => edit((sim) => void (sim.playbackRate = Math.min(20, Math.max(0.05, rate))))} />
        </Field>
        <Field label={t('simulation.freezeAt')} hint={t('simulation.freezeAtHelp')}>
          <Input
            type="number"
            min={0}
            step={0.1}
            dir="ltr"
            placeholder="—"
            value={element.freezeAt === undefined ? '' : framesToSeconds(element.freezeAt, fps)}
            onChange={(event) => {
              const seconds = Number(event.target.value);
              edit((sim) => {
                sim.freezeAt =
                  event.target.value === '' || !Number.isFinite(seconds) ? undefined : secondsToFrames(Math.max(0, seconds), fps);
              });
            }}
          />
        </Field>
      </div>
    </div>
  );
};
