import { useTranslation } from 'react-i18next';
import { createTextElement } from '../../shared/factories';
import { LANGS, type Lang } from '../../shared/schema';
import { TEXT_STYLE_PRESETS, applyStylePreset } from '../../video/text/stylePresets';
import type { UiLang } from '../i18n';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

const SAMPLE: Record<Lang, string> = { fr: 'Aa', ar: 'أب', en: 'Aa' };

/** Ajout d'un texte : par langue (police et sens d'écriture) ou par style prédéfini. */
export const TextLibrary = () => {
  const { t, i18n } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const uiLang = i18n.language as UiLang;

  const add = (lang: Lang, presetId?: string) => {
    if (!scene) return;
    const element = createTextElement(project.format, scene.durationInFrames, lang);
    const preset = TEXT_STYLE_PRESETS.find((item) => item.id === presetId);
    if (preset) {
      element.style = applyStylePreset(preset, lang, project.format);
      element.stylePresetId = preset.id;
    }
    addElement(element);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-400">{t('library.textHelp')}</p>
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          data-testid={`add-text-${lang}`}
          onClick={() => add(lang)}
          className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 p-3 text-start hover:border-sky-400"
        >
          <span lang={lang} className="w-8 text-center text-xl font-bold text-sky-300">
            {SAMPLE[lang]}
          </span>
          <span className="text-sm">{t(`library.addText.${lang}`)}</span>
        </button>
      ))}
      <h3 className="mt-3 text-xs font-semibold text-slate-300">{t('library.presets')}</h3>
      <p className="text-xs text-slate-400">{t('library.presetsHelp')}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {TEXT_STYLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            data-testid={`add-preset-${preset.id}`}
            onClick={() => add(project.defaultLang, preset.id)}
            className="rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-start text-xs hover:border-sky-400"
          >
            {preset.name[uiLang]}
          </button>
        ))}
      </div>
    </div>
  );
};
