import { useTranslation } from 'react-i18next';
import type { SubtitleStyle } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

/** Incrustation des sous-titres dans la vidéo : activée, position, taille, bandeau. */
export const SubtitleStyleFields = () => {
  const { t } = useTranslation();
  const { subtitleStyle } = useProject();
  const updateProject = useEditorStore((state) => state.updateProject);
  const set = (patch: Partial<SubtitleStyle>) =>
    updateProject((draft) => {
      draft.subtitleStyle = { ...draft.subtitleStyle, ...patch };
    });

  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="col-span-2 flex items-center gap-2 text-xs text-slate-300">
        <input type="checkbox" data-testid="subtitles-burn-in" className="h-4 w-4 accent-sky-500" checked={subtitleStyle.burnIn} onChange={(event) => set({ burnIn: event.target.checked })} />
        {t('subtitles.burnIn')}
      </label>
      <Field label={t('subtitles.position')}>
        <NativeSelect
          value={subtitleStyle.position}
          options={[
            { value: 'bottom', label: t('subtitles.positions.bottom') },
            { value: 'top', label: t('subtitles.positions.top') },
          ]}
          onChange={(event) => set({ position: event.target.value === 'top' ? 'top' : 'bottom' })}
        />
      </Field>
      <Field label={t('fields.fontSize')}>
        <NumberInput min={16} max={120} step={2} value={subtitleStyle.fontSize} onValueChange={(size) => set({ fontSize: Math.min(120, Math.max(16, size)) })} />
      </Field>
      <label className="col-span-2 flex items-center gap-2 text-xs text-slate-300">
        <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={subtitleStyle.background} onChange={(event) => set({ background: event.target.checked })} />
        {t('subtitles.background')}
      </label>
    </div>
  );
};
