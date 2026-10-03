import { useTranslation } from 'react-i18next';
import type { Background } from '../../shared/schema';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

type Props = { background: Background; onChange: (background: Background) => void };

const firstColor = (background: Background): string =>
  background.type === 'color' ? background.color : (background.stops[0]?.color ?? '#ffffff');

/** Fond de scène : couleur unie ou dégradé à deux couleurs. */
export const BackgroundFields = ({ background, onChange }: Props) => {
  const { t } = useTranslation();

  const setType = (type: string) => {
    const color = firstColor(background);
    onChange(
      type === 'linear-gradient'
        ? {
            type: 'linear-gradient',
            angle: 135,
            stops: [
              { color, position: 0 },
              { color: '#1e3a8a', position: 100 },
            ],
          }
        : { type: 'color', color },
    );
  };

  const setStopColor = (index: number, color: string) => {
    if (background.type !== 'linear-gradient') return;
    const stops = background.stops.map((stop, i) => (i === index ? { ...stop, color } : stop));
    onChange({ ...background, stops });
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('scene.background')}>
        <NativeSelect
          value={background.type}
          onChange={(event) => setType(event.target.value)}
          options={[
            { value: 'color', label: t('scene.backgroundColor') },
            { value: 'linear-gradient', label: t('scene.backgroundGradient') },
          ]}
        />
      </Field>
      {background.type === 'color' ? (
        <Field label={t('fields.color')}>
          <Input
            type="color"
            className="h-9 p-1"
            value={background.color}
            onChange={(event) => onChange({ type: 'color', color: event.target.value })}
          />
        </Field>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {background.stops.slice(0, 2).map((stop, index) => (
            <Field key={index} label={t(index === 0 ? 'scene.colorFrom' : 'scene.colorTo')}>
              <Input
                type="color"
                className="h-9 p-1"
                value={stop.color}
                onChange={(event) => setStopColor(index, event.target.value)}
              />
            </Field>
          ))}
          <Field label={t('scene.angle')}>
            <NumberInput
              step={15}
              value={background.angle}
              onValueChange={(angle) => onChange({ ...background, angle })}
            />
          </Field>
        </div>
      )}
    </div>
  );
};
