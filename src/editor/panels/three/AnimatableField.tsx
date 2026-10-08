import { useTranslation } from 'react-i18next';
import type { AnimatableNumber } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';

type Props = {
  label: string;
  value: AnimatableNumber;
  fps: number;
  step: number;
  onChange: (next: AnimatableNumber) => void;
};

/** Valeur fixe, ou qui change de « valeur » à « jusqu'à » entre deux instants. */
export const AnimatableField = ({ label, value, fps, step, onChange }: Props) => {
  const { t } = useTranslation();
  const animated = value.to !== undefined;
  return (
    <div className="grid grid-cols-4 items-end gap-1.5">
      <Field label={label}>
        <NumberInput step={step} value={value.value} onValueChange={(next) => onChange({ ...value, value: next })} />
      </Field>
      <Field label={t('science.paramTo')}>
        <Input
          type="number"
          step={step}
          placeholder="—"
          value={value.to ?? ''}
          onChange={(event) =>
            onChange({ ...value, to: event.target.value === '' ? undefined : Number(event.target.value) })
          }
        />
      </Field>
      <Field label={t('fields.start')}>
        <NumberInput
          min={0}
          step={0.1}
          disabled={!animated}
          value={framesToSeconds(value.start, fps)}
          onValueChange={(seconds) => onChange({ ...value, start: Math.max(0, secondsToFrames(seconds, fps)) })}
        />
      </Field>
      <Field label={t('fields.duration')}>
        <NumberInput
          min={0.1}
          step={0.1}
          disabled={!animated}
          value={framesToSeconds(value.duration, fps)}
          onValueChange={(seconds) => onChange({ ...value, duration: Math.max(1, secondsToFrames(seconds, fps)) })}
        />
      </Field>
    </div>
  );
};
