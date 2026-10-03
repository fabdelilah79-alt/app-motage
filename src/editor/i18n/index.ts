import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';

export const UI_LANGS = ['fr', 'ar', 'en'] as const;
export type UiLang = (typeof UI_LANGS)[number];

const STORAGE_KEY = 'physimotion.uiLang';

const isUiLang = (value: unknown): value is UiLang =>
  typeof value === 'string' && (UI_LANGS as readonly string[]).includes(value);

const readStoredLang = (): UiLang => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isUiLang(stored) ? stored : 'fr';
  } catch {
    return 'fr';
  }
};

export const uiDirection = (lang: string): 'rtl' | 'ltr' => (lang === 'ar' ? 'rtl' : 'ltr');

/** Langue et sens d'écriture de toute la page (l'arabe met l'interface en miroir). */
const applyToDocument = (lang: UiLang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = uiDirection(lang);
};

const initialLang = readStoredLang();
applyToDocument(initialLang);

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, ar: { translation: ar }, en: { translation: en } },
  lng: initialLang,
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
});

export const setUiLanguage = (lang: UiLang) => {
  void i18n.changeLanguage(lang);
  applyToDocument(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // stockage indisponible (navigation privée) : la langue n'est simplement pas mémorisée
  }
};

export { i18n };
