import { useTranslation } from 'react-i18next';
import type { ProjectFormat, TextElement } from '../../../shared/schema';
import { TEXT_STYLE_PRESETS, applyStylePreset } from '../../../video/text/stylePresets';
import type { UiLang } from '../../i18n';
import { useEditorStore } from '../../store/editorStore';
import { cn } from '../../ui/cn';

type Props = { element: TextElement; format: ProjectFormat };

/** Styles prédéfinis (Titre, Définition, À retenir…) : un clic remplace la mise en forme. */
export const StylePresetPicker = ({ element, format }: Props) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const uiLang = i18n.language as UiLang;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-slate-400">{t('text.presets')}</span>
      <div className="grid grid-cols-2 gap-1.5">
        {TEXT_STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            data-testid={`style-preset-${preset.id}`}
            className={cn(
              'rounded-md border px-2 py-1.5 text-start text-xs',
              element.stylePresetId === preset.id
                ? 'border-sky-400 text-sky-200'
                : 'border-slate-700 text-slate-300 hover:border-slate-500',
            )}
            onClick={() =>
              updateElement(element.id, (draft) => {
                if (draft.type !== 'text') return;
                draft.style = applyStylePreset(preset, draft.lang, format);
                draft.stylePresetId = preset.id;
              })
            }
          >
            {preset.name[uiLang]}
          </button>
        ))}
      </div>
    </div>
  );
};
