import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FIT_KINDS, type Series2D } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { Textarea } from '../../ui/textarea';
import { ColorInput } from '../ColorInput';
import { CurveParamsEditor } from './CurveParamsEditor';
import { formatDataPoints, parseDataPoints } from './dataPoints';
import { ExpressionInput } from './ExpressionInput';

type Props = {
  series: Series2D;
  fps: number;
  onChange: (recipe: (series: Series2D) => void) => void;
  onRemove: () => void;
};

/** Réglages d'une courbe : expression(s), données, modèle, style et tracé progressif. */
export const SeriesItem = ({ series, fps, onChange, onRemove }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-700 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200">{t(`science.seriesKinds.${series.kind}`)}</span>
        <Button size="icon" variant="ghost" aria-label={t('science.removeSeries')} onClick={onRemove}>
          <Trash2 size={14} aria-hidden />
        </Button>
      </div>
      {series.kind === 'function' ? (
        <ExpressionInput
          label="y = f(x)"
          testId="series-expr"
          value={series.expr}
          onChange={(expr) => onChange((draft) => void (draft.kind === 'function' && (draft.expr = expr)))}
        />
      ) : null}
      {series.kind === 'parametric' ? (
        <>
          <ExpressionInput label="x(t)" value={series.x} onChange={(x) => onChange((draft) => void (draft.kind === 'parametric' && (draft.x = x)))} />
          <ExpressionInput label="y(t)" value={series.y} onChange={(y) => onChange((draft) => void (draft.kind === 'parametric' && (draft.y = y)))} />
        </>
      ) : null}
      {series.kind === 'polar' ? (
        <ExpressionInput label="r(θ)" value={series.r} onChange={(r) => onChange((draft) => void (draft.kind === 'polar' && (draft.r = r)))} />
      ) : null}
      {series.kind === 'data' ? (
        <>
          <Field label={t('science.dataPoints')} hint={t('science.dataPointsHelp')}>
            <Textarea
              dir="ltr"
              className="font-mono"
              defaultValue={formatDataPoints(series.points)}
              onBlur={(event) => {
                const points = parseDataPoints(event.target.value);
                onChange((draft) => void (draft.kind === 'data' && (draft.points = points)));
              }}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('science.fit')}>
              <NativeSelect
                value={series.fit}
                options={FIT_KINDS.map((fit) => ({ value: fit, label: t(`science.fits.${fit}`) }))}
                onChange={(event) => {
                  const fit = FIT_KINDS.find((item) => item === event.target.value) ?? 'none';
                  onChange((draft) => void (draft.kind === 'data' && (draft.fit = fit)));
                }}
              />
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-xs text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 accent-sky-500"
                checked={series.showEquation}
                onChange={(event) => onChange((draft) => void (draft.kind === 'data' && (draft.showEquation = event.target.checked)))}
              />
              {t('science.showEquation')}
            </label>
          </div>
        </>
      ) : (
        <CurveParamsEditor params={series.params} fps={fps} onChange={(recipe) => onChange((draft) => recipe(draft.params))} />
      )}
      <div className="grid grid-cols-2 gap-2">
        <Field label={t('fields.color')}>
          <ColorInput compact value={series.color} onChange={(color) => onChange((draft) => void (draft.color = color))} />
        </Field>
        <Field label={t('media.strokeWidth')}>
          <NumberInput min={0.5} max={20} step={0.5} value={series.width} onValueChange={(width) => onChange((draft) => void (draft.width = width))} />
        </Field>
        <Field label={t('science.drawStart')}>
          <NumberInput min={0} step={0.1} value={framesToSeconds(series.drawStart, fps)} onValueChange={(s) => onChange((draft) => void (draft.drawStart = Math.max(0, secondsToFrames(s, fps))))} />
        </Field>
        <Field label={t('science.drawDuration')}>
          <NumberInput min={0} step={0.1} value={framesToSeconds(series.drawDuration, fps)} onValueChange={(s) => onChange((draft) => void (draft.drawDuration = Math.max(0, secondsToFrames(s, fps))))} />
        </Field>
        <Field label={t('science.seriesLabel')}>
          <Input dir="auto" value={series.label} onChange={(event) => onChange((draft) => void (draft.label = event.target.value))} />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-xs text-slate-300">
          <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={series.dashed} onChange={(event) => onChange((draft) => void (draft.dashed = event.target.checked))} />
          {t('science.dashed')}
        </label>
      </div>
    </div>
  );
};
