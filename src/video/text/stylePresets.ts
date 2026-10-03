import type { Lang, ProjectFormat, TextEffects, TextStyle } from '../../shared/schema';

type PresetLook = {
  /** Taille en proportion de la hauteur de la vidéo (s'adapte au format). */
  size: number;
  weight: 400 | 700;
  color: string;
  align: TextStyle['align'];
  lineHeight: number;
  /** Polices du catalogue selon l'écriture du texte (sinon police par défaut). */
  fonts?: { arabic?: string; latin?: string };
  effects?: (height: number) => TextEffects;
};

export type TextStylePreset = { id: string; name: Record<Lang, string>; look: PresetLook };

const card = (color: string) => (height: number): TextEffects => ({
  background: { kind: 'card', color, padding: Math.round(height * 0.03) },
});

/** Préréglages de style de texte (section 6.2 du plan). */
export const TEXT_STYLE_PRESETS: readonly TextStylePreset[] = [
  {
    id: 'title',
    name: { fr: 'Titre', ar: 'عنوان', en: 'Title' },
    look: { size: 0.1, weight: 700, color: '#0f172a', align: 'center', lineHeight: 1.2 },
  },
  {
    id: 'subtitle',
    name: { fr: 'Sous-titre', ar: 'عنوان فرعي', en: 'Subtitle' },
    look: { size: 0.055, weight: 400, color: '#334155', align: 'center', lineHeight: 1.3 },
  },
  {
    id: 'body',
    name: { fr: 'Corps de texte', ar: 'نص عادي', en: 'Body text' },
    look: { size: 0.042, weight: 400, color: '#1e293b', align: 'start', lineHeight: 1.5 },
  },
  {
    id: 'caption',
    name: { fr: 'Légende', ar: 'تعليق', en: 'Caption' },
    look: { size: 0.03, weight: 400, color: '#475569', align: 'start', lineHeight: 1.4 },
  },
  {
    id: 'definition',
    name: { fr: 'Encadré « Définition »', ar: 'إطار «تعريف»', en: '“Definition” box' },
    look: {
      size: 0.04,
      weight: 400,
      color: '#0c4a6e',
      align: 'start',
      lineHeight: 1.5,
      effects: card('#e0f2fe'),
    },
  },
  {
    id: 'remember',
    name: { fr: 'Encadré « À retenir »', ar: 'إطار «للتذكّر»', en: '“Key point” box' },
    look: {
      size: 0.042,
      weight: 700,
      color: '#713f12',
      align: 'start',
      lineHeight: 1.5,
      effects: card('#fef9c3'),
    },
  },
  {
    id: 'warning',
    name: { fr: 'Encadré « Attention »', ar: 'إطار «انتبه»', en: '“Warning” box' },
    look: {
      size: 0.04,
      weight: 700,
      color: '#7f1d1d',
      align: 'start',
      lineHeight: 1.5,
      effects: card('#fee2e2'),
    },
  },
  {
    id: 'keyFormula',
    name: { fr: 'Formule clé', ar: 'صيغة أساسية', en: 'Key formula' },
    look: {
      size: 0.07,
      weight: 700,
      color: '#0f172a',
      align: 'center',
      lineHeight: 1.3,
      effects: (height) => ({
        background: { kind: 'pill', color: '#f1f5f9', padding: Math.round(height * 0.025) },
      }),
    },
  },
  {
    id: 'value',
    name: { fr: 'Valeur numérique + unité', ar: 'قيمة عددية + وحدة', en: 'Value + unit' },
    look: {
      size: 0.12,
      weight: 700,
      color: '#2563eb',
      align: 'center',
      lineHeight: 1.1,
      fonts: { latin: 'poppins', arabic: 'cairo' },
    },
  },
  {
    id: 'quote',
    name: { fr: 'Citation', ar: 'اقتباس', en: 'Quote' },
    look: {
      size: 0.05,
      weight: 400,
      color: '#334155',
      align: 'center',
      lineHeight: 1.5,
      fonts: { latin: 'lora', arabic: 'amiri' },
    },
  },
];

export const findStylePreset = (id: string | undefined): TextStylePreset | undefined =>
  TEXT_STYLE_PRESETS.find((preset) => preset.id === id);

/** Style complet d'un texte après application d'un préréglage (fonction pure). */
export const applyStylePreset = (
  preset: TextStylePreset,
  lang: Lang,
  format: ProjectFormat,
): TextStyle => {
  const { look } = preset;
  return {
    fontId: lang === 'ar' ? look.fonts?.arabic : look.fonts?.latin,
    fontSize: Math.round(format.height * look.size),
    fontWeight: look.weight,
    color: look.color,
    align: look.align,
    lineHeight: look.lineHeight,
    letterSpacing: 0,
    textTransform: 'none',
    effects: look.effects ? look.effects(format.height) : {},
  };
};
