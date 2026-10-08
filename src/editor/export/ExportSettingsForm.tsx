import { useTranslation } from 'react-i18next';
import {
  EXPORT_FORMATS,
  EXPORT_QUALITIES,
  EXPORT_SIZES,
  exportedSeconds,
  type ExportOptions,
} from '../../shared/exportOptions';
import type { Project } from '../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

type Props = { project: Project; options: ExportOptions; onChange: (options: ExportOptions) => void };

const RANGES = ['all', 'scene', 'interval'] as const;

/** Réglages d'export : format, qualité, taille, partie de la vidéo, sous-titres. */
export const ExportSettingsForm = ({ project, options, onChange }: Props) => {
  const { t } = useTranslation();
  const { fps, width, height } = project.format;
  const set = (patch: Partial<ExportOptions>) => onChange({ ...options, ...patch });
  const factor = { half: 0.5, full: 1, double: 2 }[options.size];
  const isStill = options.format === 'png';
  const longGif = options.format === 'gif' && exportedSeconds(project, options) > 15;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label={t('exportSettings.format')}>
        <NativeSelect
          data-testid="export-format"
          value={options.format}
          options={EXPORT_FORMATS.map((format) => ({ value: format, label: t(`exportSettings.formats.${format}`) }))}
          onChange={(event) => set({ format: EXPORT_FORMATS.find((item) => item === event.target.value) ?? 'mp4' })}
        />
      </Field>
      <Field label={t('exportSettings.quality')}>
        <NativeSelect
          data-testid="export-quality"
          value={options.quality}
          options={EXPORT_QUALITIES.map((quality) => ({ value: quality, label: t(`exportSettings.qualities.${quality}`) }))}
          onChange={(event) => set({ quality: EXPORT_QUALITIES.find((item) => item === event.target.value) ?? 'standard' })}
        />
      </Field>
      <Field label={t('exportSettings.size')}>
        <NativeSelect
          value={options.size}
          options={EXPORT_SIZES.map((size) => {
            const scale = { half: 0.5, full: 1, double: 2 }[size];
            return { value: size, label: `${Math.round(width * scale)} × ${Math.round(height * scale)}` };
          })}
          onChange={(event) => set({ size: EXPORT_SIZES.find((item) => item === event.target.value) ?? 'full' })}
        />
      </Field>
      <p className="self-end pb-2 text-xs text-slate-400">
        {t('exportSettings.fpsInfo', { fps, width: Math.round(width * factor), height: Math.round(height * factor) })}
      </p>
      {isStill ? (
        <Field label={t('exportSettings.stillAt')}>
          <NumberInput min={0} step={0.1} value={framesToSeconds(options.stillFrame, fps)} onValueChange={(s) => set({ stillFrame: Math.max(0, secondsToFrames(s, fps)) })} />
        </Field>
      ) : (
        <>
          <Field label={t('exportSettings.range')}>
            <NativeSelect
              data-testid="export-range"
              value={options.range.kind}
              options={RANGES.map((kind) => ({ value: kind, label: t(`exportSettings.ranges.${kind}`) }))}
              onChange={(event) => {
                const kind = event.target.value;
                const first = project.scenes[0];
                if (kind === 'scene' && first) set({ range: { kind: 'scene', sceneId: first.id } });
                else if (kind === 'interval') set({ range: { kind: 'interval', from: 0, to: fps * 5 } });
                else set({ range: { kind: 'all' } });
              }}
            />
          </Field>
          {options.range.kind === 'scene' ? (
            <Field label={t('exportSettings.scene')}>
              <NativeSelect
                value={options.range.sceneId}
                options={project.scenes.map((scene, index) => ({ value: scene.id, label: scene.name || t('scene.title', { number: index + 1 }) }))}
                onChange={(event) => set({ range: { kind: 'scene', sceneId: event.target.value } })}
              />
            </Field>
          ) : null}
          {options.range.kind === 'interval' ? (
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('exportSettings.from')}>
                <NumberInput min={0} step={0.5} value={framesToSeconds(options.range.from, fps)} onValueChange={(s) => options.range.kind === 'interval' && set({ range: { ...options.range, from: Math.max(0, secondsToFrames(s, fps)) } })} />
              </Field>
              <Field label={t('exportSettings.to')}>
                <NumberInput min={0} step={0.5} value={framesToSeconds(options.range.to, fps)} onValueChange={(s) => options.range.kind === 'interval' && set({ range: { ...options.range, to: Math.max(0, secondsToFrames(s, fps)) } })} />
              </Field>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-xs text-slate-300 sm:col-span-2">
            <input type="checkbox" data-testid="export-srt" className="h-4 w-4 accent-sky-500" checked={options.srt} onChange={(event) => set({ srt: event.target.checked })} />
            {t('exportSettings.srt')}
          </label>
        </>
      )}
      {longGif ? <p className="text-xs text-amber-300 sm:col-span-2">{t('exportSettings.longGif')}</p> : null}
    </div>
  );
};
