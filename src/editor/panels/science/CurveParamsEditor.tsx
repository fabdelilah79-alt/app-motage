import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnimatableNumber } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';

type Props = {
  params: Record<string, AnimatableNumber>;
  fps: number;
  onChange: (recipe: (params: Record<string, AnimatableNumber>) => void) => void;
};

/**
 * Paramètres d'une courbe (a, ω, A…) : valeur fixe, ou valeur qui change pendant la vidéo
 * (« jusqu'à ») → la courbe se déforme.
 */
export const CurveParamsEditor = ({ params, fps, onChange }: Props) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const update = (key: string, patch: Partial<AnimatableNumber>) =>
    onChange((draft) => {
      const current = draft[key];
      if (current) draft[key] = { ...current, ...patch };
    });

  return (
    <div className="flex flex-col gap-1.5">
      {Object.entries(params).map(([key, number]) => (
        <div key={key} className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-end gap-1.5">
          <span className="pb-2 font-mono text-sm text-slate-200" dir="ltr">
            {key}
          </span>
          <Field label={t('science.paramValue')}>
            <NumberInput step={0.1} value={number.value} onValueChange={(value) => update(key, { value })} />
          </Field>
          <Field label={t('science.paramTo')}>
            <Input
              type="number"
              step={0.1}
              placeholder="—"
              value={number.to ?? ''}
              onChange={(event) =>
                update(key, { to: event.target.value === '' ? undefined : Number(event.target.value) })
              }
            />
          </Field>
          <Field label={t('fields.duration')}>
            <NumberInput
              min={0.1}
              step={0.1}
              disabled={number.to === undefined}
              value={framesToSeconds(number.duration, fps)}
              onValueChange={(seconds) => update(key, { duration: Math.max(1, secondsToFrames(seconds, fps)) })}
            />
          </Field>
          <Button
            size="icon"
            variant="ghost"
            aria-label={t('science.removeParam')}
            onClick={() => onChange((draft) => void delete draft[key])}
          >
            <Trash2 size={14} aria-hidden />
          </Button>
        </div>
      ))}
      <div className="flex items-end gap-1.5">
        <Field label={t('science.newParam')}>
          <Input dir="ltr" className="w-24 font-mono" value={name} onChange={(event) => setName(event.target.value.trim())} />
        </Field>
        <Button
          size="sm"
          disabled={!/^[A-Za-zͰ-Ͽ][A-Za-z0-9_]*$/.test(name) || name in params}
          onClick={() => {
            onChange((draft) => {
              draft[name] = { value: 1, start: 0, duration: fps * 2, easing: 'smooth' };
            });
            setName('');
          }}
        >
          <Plus size={14} aria-hidden />
          {t('science.addParam')}
        </Button>
      </div>
    </div>
  );
};
