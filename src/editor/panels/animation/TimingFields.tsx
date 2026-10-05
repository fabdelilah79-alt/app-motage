import { useTranslation } from 'react-i18next';
import { EASING_IDS, type AnimationRef } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Field } from '../../ui/field';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';

type Props = {
  value: AnimationRef;
  fps: number;
  onChange: (value: AnimationRef) => void;
  /** Libellé du délai : « Délai » (apparition), « Début » (mise en valeur)… */
  delayLabelKey: string;
  showRepeat?: boolean;
};

const seconds = (frames: number, fps: number) => Number(framesToSeconds(frames, fps).toFixed(2));

/** Durée, délai, accélération et répétitions d'une animation (temps affichés en secondes). */
export const TimingFields = ({ value, fps, onChange, delayLabelKey, showRepeat = false }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label={t('fields.inSeconds', { label: t('fields.duration') })}>
        <NumberInput
          min={0.1}
          step={0.1}
          value={seconds(value.duration, fps)}
          onValueChange={(next) =>
            onChange({ ...value, duration: Math.max(1, secondsToFrames(next, fps)) })
          }
        />
      </Field>
      <Field label={t('fields.inSeconds', { label: t(delayLabelKey) })}>
        <NumberInput
          min={0}
          step={0.1}
          value={seconds(value.delay, fps)}
          onValueChange={(next) =>
            onChange({ ...value, delay: Math.max(0, secondsToFrames(next, fps)) })
          }
        />
      </Field>
      <Field label={t('animation.easing')}>
        <NativeSelect
          value={value.easing}
          options={EASING_IDS.map((id) => ({ value: id, label: t(`animation.easings.${id}`) }))}
          onChange={(event) => {
            const easing = EASING_IDS.find((id) => id === event.target.value);
            if (easing) onChange({ ...value, easing });
          }}
        />
      </Field>
      {showRepeat ? (
        <Field label={t('animation.repeat')}>
          <NumberInput
            min={1}
            max={20}
            step={1}
            value={value.repeat}
            onValueChange={(next) =>
              onChange({ ...value, repeat: Math.min(20, Math.max(1, Math.round(next))) })
            }
          />
        </Field>
      ) : null}
    </div>
  );
};
