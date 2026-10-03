import { useTranslation } from 'react-i18next';
import { createTextElement } from '../../shared/factories';
import { LANGS, type Lang } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

const SAMPLE: Record<Lang, string> = { fr: 'Aa', ar: 'أب', en: 'Aa' };

/** Ajout d'un texte : la langue choisie fixe la police et le sens d'écriture. */
export const TextLibrary = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);

  const add = (lang: Lang) => {
    if (!scene) return;
    addElement(createTextElement(project.format, scene.durationInFrames, lang));
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
    </div>
  );
};
