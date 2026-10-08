import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PlotDecoration, Series2D } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ColorInput } from '../ColorInput';

type Props = {
  decoration: PlotDecoration;
  series: readonly Series2D[];
  fps: number;
  onChange: (recipe: (decoration: PlotDecoration) => void) => void;
  onRemove: () => void;
};

type NumberKey = 'from' | 'to' | 'value' | 'x' | 'y';

/** Réglages d'une décoration du repère. */
export const DecorationItem = ({ decoration, series, fps, onChange, onRemove }: Props) => {
  const { t } = useTranslation();
  const number = (key: NumberKey, labelKey: string) =>
    key in decoration ? (
      <Field key={key} label={t(labelKey)}>
        <NumberInput
          step={0.1}
          value={Number((decoration as Record<string, unknown>)[key] ?? 0)}
          onValueChange={(value) =>
            onChange((draft) => {
              if (key in draft) Object.assign(draft, { [key]: value });
            })
          }
        />
      </Field>
    ) : null;
  const flag = (key: 'showCoords' | 'guides' | 'tangent', labelKey: string) =>
    key in decoration ? (
      <label key={key} className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 accent-sky-500"
          checked={(decoration as Record<string, unknown>)[key] === true}
          onChange={(event) => onChange((draft) => void Object.assign(draft, { [key]: event.target.checked }))}
        />
        {t(labelKey)}
      </label>
    ) : null;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-700 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200">{t(`science.decorationKinds.${decoration.kind}`)}</span>
        <Button size="icon" variant="ghost" aria-label={t('science.removeDecoration')} onClick={onRemove}>
          <Trash2 size={14} aria-hidden />
        </Button>
      </div>
      {'seriesId' in decoration ? (
        <Field label={t('science.targetSeries')}>
          <NativeSelect
            value={decoration.seriesId}
            options={series.map((item, index) => ({ value: item.id, label: `${index + 1}. ${t(`science.seriesKinds.${item.kind}`)}` }))}
            onChange={(event) => onChange((draft) => void ('seriesId' in draft && (draft.seriesId = event.target.value)))}
          />
        </Field>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        {number('from', 'science.decoFrom')}
        {number('to', 'science.decoTo')}
        {number('value', 'science.decoValue')}
        {number('x', 'fields.x')}
        {number('y', 'fields.y')}
        {'start' in decoration ? (
          <Field label={t('fields.start')}>
            <NumberInput min={0} step={0.1} value={framesToSeconds(decoration.start, fps)} onValueChange={(s) => onChange((draft) => void ('start' in draft && (draft.start = Math.max(0, secondsToFrames(s, fps)))))} />
          </Field>
        ) : null}
        {'duration' in decoration ? (
          <Field label={t('fields.duration')}>
            <NumberInput min={0.1} step={0.1} value={framesToSeconds(decoration.duration, fps)} onValueChange={(s) => onChange((draft) => void ('duration' in draft && (draft.duration = Math.max(1, secondsToFrames(s, fps)))))} />
          </Field>
        ) : null}
        {decoration.kind === 'asymptote' ? (
          <Field label={t('science.orientation')}>
            <NativeSelect
              value={decoration.orientation}
              options={[
                { value: 'horizontal', label: t('science.orientations.horizontal') },
                { value: 'vertical', label: t('science.orientations.vertical') },
              ]}
              onChange={(event) => onChange((draft) => void (draft.kind === 'asymptote' && (draft.orientation = event.target.value === 'vertical' ? 'vertical' : 'horizontal')))}
            />
          </Field>
        ) : null}
        <Field label={t('fields.color')}>
          <ColorInput compact value={decoration.color} onChange={(color) => onChange((draft) => void (draft.color = color))} />
        </Field>
      </div>
      {'label' in decoration || decoration.kind === 'annotation' ? (
        <Field label={t('science.decoLabel')}>
          <Input
            dir="auto"
            value={decoration.kind === 'annotation' ? decoration.text : 'label' in decoration ? decoration.label : ''}
            onChange={(event) =>
              onChange((draft) => {
                if (draft.kind === 'annotation') draft.text = event.target.value;
                else if ('label' in draft) draft.label = event.target.value;
              })
            }
          />
        </Field>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {flag('showCoords', 'science.showCoords')}
        {flag('guides', 'science.guides')}
        {flag('tangent', 'science.tangent')}
      </div>
    </div>
  );
};
