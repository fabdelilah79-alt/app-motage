import { useTranslation } from 'react-i18next';
import type { Axes3D, Scene3DElement } from '../../../shared/schema';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';
import { useScene3DEdit } from './useScene3DEdit';

const FLAGS = ['show', 'grid', 'labels'] as const;
const NAMES = ['xLabel', 'yLabel', 'zLabel'] as const;

/** Repère 3D : affichage, quadrillage, noms des axes, taille. */
export const Axes3DEditor = ({ element }: { element: Scene3DElement }) => {
  const { t } = useTranslation();
  const edit = useScene3DEdit(element.id);
  const set = <K extends keyof Axes3D>(key: K, value: Axes3D[K]) =>
    edit((scene) => {
      scene.axes[key] = value;
    });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('science.axes')}</p>
      <div className="flex flex-wrap gap-3">
        {FLAGS.map((key) => (
          <label key={key} className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={element.axes[key]} onChange={(event) => set(key, event.target.checked)} />
            {t(`three.axesFlags.${key}`)}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {NAMES.map((key) => (
          <Field key={key} label={t(`three.axisNames.${key}`)}>
            <Input dir="auto" value={element.axes[key]} onChange={(event) => set(key, event.target.value)} />
          </Field>
        ))}
        <Field label={t('three.axesSize')}>
          <NumberInput min={1} step={1} value={element.axes.size} onValueChange={(size) => set('size', Math.max(0.5, size))} />
        </Field>
      </div>
    </div>
  );
};
