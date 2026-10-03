import { useTranslation } from 'react-i18next';
import type { SceneTransition, TransitionDirection, TransitionType } from '../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

const TYPES: readonly TransitionType[] = ['none', 'fade', 'slide'];
const DIRECTIONS: readonly TransitionDirection[] = [
  'from-left',
  'from-right',
  'from-top',
  'from-bottom',
];

type Props = {
  transition: SceneTransition | undefined;
  fps: number;
  onChange: (transition: SceneTransition) => void;
};

/** Transition qui mène à cette scène depuis la précédente. */
export const TransitionFields = ({ transition, fps, onChange }: Props) => {
  const { t } = useTranslation();
  const current: SceneTransition = transition ?? {
    type: 'none',
    durationInFrames: 15,
    direction: 'from-right',
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('scene.transition')}>
        <NativeSelect
          data-testid="scene-transition"
          value={current.type}
          options={TYPES.map((type) => ({ value: type, label: t(`scene.transitions.${type}`) }))}
          onChange={(event) => {
            const type = TYPES.find((item) => item === event.target.value) ?? 'none';
            onChange({ ...current, type });
          }}
        />
      </Field>
      {current.type !== 'none' ? (
        <Field label={t('fields.inSeconds', { label: t('fields.duration') })}>
          <NumberInput
            min={0.1}
            step={0.1}
            value={Number(framesToSeconds(current.durationInFrames, fps).toFixed(2))}
            onValueChange={(seconds) =>
              onChange({ ...current, durationInFrames: Math.max(1, secondsToFrames(seconds, fps)) })
            }
          />
        </Field>
      ) : null}
      {current.type === 'slide' ? (
        <Field label={t('scene.direction')}>
          <NativeSelect
            value={current.direction}
            options={DIRECTIONS.map((item) => ({
              value: item,
              label: t(`scene.directions.${item}`),
            }))}
            onChange={(event) => {
              const direction = DIRECTIONS.find((item) => item === event.target.value);
              if (direction) onChange({ ...current, direction });
            }}
          />
        </Field>
      ) : null}
    </div>
  );
};
