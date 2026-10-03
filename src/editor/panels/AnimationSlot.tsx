import { useTranslation } from 'react-i18next';
import type { AnimationRef } from '../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { ANIMATION_PRESETS } from '../../video/animations/registry';
import type { AnimationCategory } from '../../video/animations/types';
import type { UiLang } from '../i18n';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

const NONE = '';
const SIDES = ['left', 'right', 'top', 'bottom'] as const;

type Props = {
  category: AnimationCategory;
  value: AnimationRef | undefined;
  fps: number;
  onChange: (value: AnimationRef | undefined) => void;
};

/** Paramètres par défaut d'un préréglage (pour savoir quels réglages proposer). */
const defaultParamsOf = (presetId: string): Record<string, unknown> => {
  const defaults: unknown = ANIMATION_PRESETS[presetId]?.paramsSchema.parse({});
  return typeof defaults === 'object' && defaults !== null ? { ...defaults } : {};
};

/** Un menu « Apparition » ou « Disparition » : préréglage, durée et sens éventuel. */
export const AnimationSlot = ({ category, value, fps, onChange }: Props) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as UiLang;
  const presets = Object.values(ANIMATION_PRESETS).filter((item) => item.category === category);
  const options = [
    { value: NONE, label: t('animation.none') },
    ...presets.map((item) => ({ value: item.id, label: item.name[lang] ?? item.name.fr })),
  ];
  const params = value ? { ...defaultParamsOf(value.presetId), ...value.params } : {};
  const side = typeof params.side === 'string' ? params.side : undefined;

  const selectPreset = (presetId: string) => {
    const preset = ANIMATION_PRESETS[presetId];
    onChange(
      preset
        ? { presetId, duration: preset.defaultDuration, delay: 0, easing: 'smooth', params: {} }
        : undefined,
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 p-3">
      <Field label={t(`animation.${category}`)}>
        <NativeSelect
          data-testid={`animation-${category}`}
          value={value?.presetId ?? NONE}
          options={options}
          onChange={(event) => selectPreset(event.target.value)}
        />
      </Field>
      {value ? (
        <Field label={t('fields.inSeconds', { label: t('fields.duration') })}>
          <NumberInput
            min={0.1}
            step={0.1}
            value={Number(framesToSeconds(value.duration, fps).toFixed(2))}
            onValueChange={(seconds) =>
              onChange({ ...value, duration: Math.max(1, secondsToFrames(seconds, fps)) })
            }
          />
        </Field>
      ) : null}
      {value && side ? (
        <Field label={t(category === 'exit' ? 'animation.sideExit' : 'animation.sideEnter')}>
          <NativeSelect
            value={side}
            options={SIDES.map((item) => ({ value: item, label: t(`animation.sides.${item}`) }))}
            onChange={(event) =>
              onChange({ ...value, params: { ...value.params, side: event.target.value } })
            }
          />
        </Field>
      ) : null}
    </div>
  );
};
