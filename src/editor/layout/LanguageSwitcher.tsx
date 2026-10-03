import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UI_LANGS, setUiLanguage, type UiLang } from '../i18n';
import { NativeSelect } from '../ui/native-select';

/** Langue de l'interface ; en arabe, toute l'interface passe de droite à gauche. */
export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const options = UI_LANGS.map((lang) => ({ value: lang, label: t(`uiLangs.${lang}`) }));

  return (
    <label className="flex items-center gap-2" title={t('topBar.uiLanguage')}>
      <Languages size={16} className="text-slate-400" aria-hidden />
      <span className="sr-only">{t('topBar.uiLanguage')}</span>
      <NativeSelect
        data-testid="ui-language"
        className="h-8 w-28"
        options={options}
        value={i18n.language}
        onChange={(event) => setUiLanguage(event.target.value as UiLang)}
      />
    </label>
  );
};
