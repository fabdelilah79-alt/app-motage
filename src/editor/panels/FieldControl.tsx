import { useTranslation } from 'react-i18next';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';
import { Textarea } from '../ui/textarea';
import type { FieldDescriptor, FieldValue } from './fieldDescriptors';

type Props<E> = {
  descriptor: FieldDescriptor<E>;
  element: E;
  fps: number;
  onChange: (descriptor: FieldDescriptor<E>, value: FieldValue) => void;
};

const roundTo = (value: number, decimals: number) => Number(value.toFixed(decimals));

/** Affiche le bon contrôle selon le type de champ (nombre, secondes, couleur, liste, texte). */
export const FieldControl = <E,>({ descriptor, element, fps, onChange }: Props<E>) => {
  const { t } = useTranslation();
  const value = descriptor.get(element);
  const change = (next: FieldValue) => onChange(descriptor, next);
  const label = t(descriptor.labelKey);
  const testId = `field-${descriptor.id}`;
  const numeric = { min: descriptor.min, max: descriptor.max, step: descriptor.step };

  switch (descriptor.kind) {
    case 'boolean':
      return (
        <label className="flex items-center gap-2 self-end pb-2 text-xs text-slate-300">
          <input
            type="checkbox"
            data-testid={testId}
            className="h-4 w-4 accent-sky-500"
            checked={value === true}
            onChange={(event) => change(event.target.checked)}
          />
          {label}
        </label>
      );
    case 'textarea':
      return (
        <Field label={label}>
          <Textarea
            dir="auto"
            data-testid={testId}
            value={String(value)}
            onChange={(event) => change(event.target.value)}
          />
        </Field>
      );
    case 'select':
      return (
        <Field label={label}>
          <NativeSelect
            data-testid={testId}
            value={String(value)}
            onChange={(event) => change(event.target.value)}
            options={(descriptor.options ?? []).map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
          />
        </Field>
      );
    case 'color':
      return (
        <Field label={label}>
          <Input
            type="color"
            data-testid={testId}
            className="h-9 p-1"
            value={String(value)}
            onChange={(event) => change(event.target.value)}
          />
        </Field>
      );
    case 'seconds':
      return (
        <Field label={t('fields.inSeconds', { label })}>
          <NumberInput
            data-testid={testId}
            {...numeric}
            value={roundTo(framesToSeconds(Number(value), fps), 2)}
            onValueChange={(seconds) => change(secondsToFrames(seconds, fps))}
          />
        </Field>
      );
    case 'percent':
      return (
        <Field label={t('fields.inPercent', { label })}>
          <NumberInput
            data-testid={testId}
            {...numeric}
            value={Math.round(Number(value) * 100)}
            onValueChange={(percent) => change(percent / 100)}
          />
        </Field>
      );
    case 'number':
      return (
        <Field label={label}>
          <NumberInput
            data-testid={testId}
            {...numeric}
            value={roundTo(Number(value), 2)}
            onValueChange={change}
          />
        </Field>
      );
  }
};
