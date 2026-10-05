import { useTranslation } from 'react-i18next';
import type { AnimationRef, SceneElement } from '../../shared/schema';
import { getAnimationPreset } from '../../video/animations/registry';
import { AnimationPicker } from './animation/AnimationPicker';
import { newAnimationRef } from './animation/newAnimationRef';
import { ParamsEditor } from './animation/ParamsEditor';
import { TimingFields } from './animation/TimingFields';

type Props = {
  category: 'enter' | 'exit';
  element: SceneElement;
  value: AnimationRef | undefined;
  fps: number;
  onChange: (value: AnimationRef | undefined) => void;
};

/** Un menu « Apparition » ou « Disparition » : préréglage, durée, délai, accélération, réglages. */
export const AnimationSlot = ({ category, element, value, fps, onChange }: Props) => {
  const { t } = useTranslation();
  const preset = value ? getAnimationPreset(value.presetId) : undefined;
  const isArabic = element.type === 'text' && element.lang === 'ar';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 p-3">
      <AnimationPicker
        categories={[category]}
        elementType={element.type}
        value={value?.presetId}
        allowNone
        label={t(`animation.${category}`)}
        testId={`animation-${category}`}
        onChange={(presetId) => onChange(presetId ? newAnimationRef(presetId) : undefined)}
      />
      {preset && !preset.arabicCompatible && isArabic ? (
        <p className="text-xs text-amber-300">{t('animation.letterFallback')}</p>
      ) : null}
      {value && preset ? (
        <>
          <TimingFields
            value={value}
            fps={fps}
            onChange={onChange}
            delayLabelKey={category === 'exit' ? 'animation.endOffset' : 'animation.delay'}
          />
          <ParamsEditor
            preset={preset}
            params={value.params}
            onChange={(params) => onChange({ ...value, params })}
          />
        </>
      ) : null}
    </div>
  );
};
