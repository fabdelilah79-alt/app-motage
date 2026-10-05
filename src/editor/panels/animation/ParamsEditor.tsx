import { useTranslation } from 'react-i18next';
import type { AnimationPreset } from '../../../video/animations/types';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ColorInput } from '../ColorInput';

type Props = {
  preset: AnimationPreset;
  params: Record<string, unknown>;
  onChange: (params: Record<string, unknown>) => void;
};

/** Réglages d'un préréglage (sens, distance, couleur…), décrits par ses métadonnées. */
export const ParamsEditor = ({ preset, params, onChange }: Props) => {
  const { t } = useTranslation();
  const parsed: unknown = preset.paramsSchema.safeParse(params).data ?? preset.paramsSchema.parse({});
  const values = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  const set = (key: string, value: unknown) => onChange({ ...params, [key]: value });
  const fields = preset.paramFields ?? [];
  if (fields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((field) => {
        const label = t(`animation.params.${field.key}`);
        const value = values[field.key];
        switch (field.kind) {
          case 'select':
            return (
              <Field key={field.key} label={label}>
                <NativeSelect
                  value={String(value)}
                  options={field.options.map((option) => ({
                    value: option,
                    label: t(`animation.options.${option}`),
                  }))}
                  onChange={(event) => set(field.key, event.target.value)}
                />
              </Field>
            );
          case 'number':
            return (
              <Field key={field.key} label={label}>
                <NumberInput
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={typeof value === 'number' ? value : 0}
                  onValueChange={(next) => set(field.key, next)}
                />
              </Field>
            );
          case 'color':
            return (
              <Field key={field.key} label={label}>
                <ColorInput
                  value={typeof value === 'string' ? value : '#000000'}
                  onChange={(next) => set(field.key, next)}
                />
              </Field>
            );
        }
      })}
      {values.form === 'custom' ? (
        <div className="col-span-2">
          <Field label={t('animation.params.points')} hint={t('animation.pointsHelp')}>
            <Input
              dir="ltr"
              className="font-mono"
              value={typeof values.points === 'string' ? values.points : ''}
              onChange={(event) => set('points', event.target.value)}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
};
