import { useTranslation } from 'react-i18next';
import type { Axes2D, Plot2DElement } from '../../../shared/schema';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';
import { usePlotEdit } from './usePlotEdit';

const BOUNDS = ['xMin', 'xMax', 'yMin', 'yMax', 'xStep', 'yStep'] as const;

/** Bornes, graduations (0 = automatique) et noms des axes avec unités. */
export const AxesEditor = ({ element }: { element: Plot2DElement }) => {
  const { t } = useTranslation();
  const edit = usePlotEdit(element.id);
  const set = <K extends keyof Axes2D>(key: K, value: Axes2D[K]) =>
    edit((plot) => {
      plot.axes[key] = value;
    });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('science.axes')}</p>
      <div className="grid grid-cols-2 gap-2">
        {BOUNDS.map((key) => (
          <Field key={key} label={t(`science.bounds.${key}`)}>
            <NumberInput
              step={0.5}
              value={element.axes[key]}
              onValueChange={(value) => set(key, key.endsWith('Step') ? Math.max(0, value) : value)}
            />
          </Field>
        ))}
        <Field label={t('science.xLabel')}>
          <Input dir="auto" value={element.axes.xLabel} onChange={(event) => set('xLabel', event.target.value)} />
        </Field>
        <Field label={t('science.yLabel')}>
          <Input dir="auto" value={element.axes.yLabel} onChange={(event) => set('yLabel', event.target.value)} />
        </Field>
      </div>
    </div>
  );
};
