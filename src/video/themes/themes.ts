import type { Background, Lang, TransitionType } from '../../shared/schema';

/** Couleurs nommées d'un thème ; un élément peut y faire référence par « theme.<nom> ». */
export const PALETTE_TOKENS = [
  'background',
  'surface',
  'text',
  'muted',
  'accent1',
  'accent2',
  'accent3',
  'grid',
] as const;
export type PaletteToken = (typeof PALETTE_TOKENS)[number];

export type Theme = {
  id: string;
  name: Record<Lang, string>;
  palette: Record<PaletteToken, string>;
  /** Polices du catalogue : une pour l'arabe, une pour le latin, harmonisées. */
  fonts: { arabic: string; latin: string };
  /** Fond par défaut des scènes (jamais « theme »). */
  background: Exclude<Background, { type: 'theme' }>;
  /** « sketch » : formes dessinées à la main (Rough.js, graine fixe). */
  strokeStyle: 'clean' | 'sketch';
  /** Ombre portée douce sous les formes (style papier découpé). */
  shapeShadow: boolean;
  defaultEnter: string;
  defaultTransition: TransitionType;
};

/** Les 9 thèmes de la section 6.5 du plan. */
export const THEMES: readonly Theme[] = [
  {
    id: 'chalkboard',
    name: { fr: 'Tableau noir', ar: 'سبورة', en: 'Chalkboard' },
    palette: {
      background: '#26332c',
      surface: '#33443a',
      text: '#f1f5f0',
      muted: '#b8c4bb',
      accent1: '#fde68a',
      accent2: '#93c5fd',
      accent3: '#fca5a5',
      grid: '#3f5247',
    },
    fonts: { arabic: 'aref-ruqaa', latin: 'kalam' },
    background: { type: 'texture', texture: 'slate', color: '#26332c' },
    strokeStyle: 'sketch',
    shapeShadow: false,
    defaultEnter: 'enter.handwriting',
    defaultTransition: 'fade',
  },
  {
    id: 'notebook',
    name: { fr: 'Cahier', ar: 'دفتر', en: 'Notebook' },
    palette: {
      background: '#fdfcf7',
      surface: '#ffffff',
      text: '#1e3a8a',
      muted: '#64748b',
      accent1: '#dc2626',
      accent2: '#2563eb',
      accent3: '#fde047',
      grid: '#bfdbfe',
    },
    fonts: { arabic: 'amiri', latin: 'patrick-hand' },
    background: { type: 'texture', texture: 'lined', color: '#fdfcf7' },
    strokeStyle: 'sketch',
    shapeShadow: false,
    defaultEnter: 'enter.wipe',
    defaultTransition: 'slide',
  },
  {
    id: 'blueprint',
    name: { fr: 'Blueprint', ar: 'مخطط هندسي', en: 'Blueprint' },
    palette: {
      background: '#1e3a8a',
      surface: '#1e40af',
      text: '#e0f2fe',
      muted: '#93c5fd',
      accent1: '#ffffff',
      accent2: '#7dd3fc',
      accent3: '#fbbf24',
      grid: '#3b5fc0',
    },
    fonts: { arabic: 'noto-kufi-arabic', latin: 'jetbrains-mono' },
    background: { type: 'texture', texture: 'blueprint', color: '#1e3a8a' },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.draw',
    defaultTransition: 'wipe',
  },
  {
    id: 'minimal-light',
    name: { fr: 'Minimal clair', ar: 'بسيط فاتح', en: 'Minimal light' },
    palette: {
      background: '#ffffff',
      surface: '#f1f5f9',
      text: '#0f172a',
      muted: '#64748b',
      accent1: '#2563eb',
      accent2: '#f97316',
      accent3: '#10b981',
      grid: '#e2e8f0',
    },
    fonts: { arabic: 'cairo', latin: 'inter' },
    background: { type: 'color', color: '#ffffff' },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.fade',
    defaultTransition: 'fade',
  },
  {
    id: 'dark-math',
    name: { fr: 'Sombre mathématique', ar: 'رياضي داكن', en: 'Dark math' },
    palette: {
      background: '#0b1120',
      surface: '#1e1b4b',
      text: '#e2e8f0',
      muted: '#94a3b8',
      accent1: '#a5b4fc',
      accent2: '#f9a8d4',
      accent3: '#86efac',
      grid: '#1e293b',
    },
    fonts: { arabic: 'amiri', latin: 'lora' },
    background: {
      type: 'linear-gradient',
      angle: 160,
      stops: [
        { color: '#0b1120', position: 0 },
        { color: '#1e1b4b', position: 100 },
      ],
    },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.blur',
    defaultTransition: 'fade',
  },
  {
    id: 'neon',
    name: { fr: 'Néon', ar: 'نيون', en: 'Neon' },
    palette: {
      background: '#050505',
      surface: '#111111',
      text: '#f0f9ff',
      muted: '#a1a1aa',
      accent1: '#22d3ee',
      accent2: '#e879f9',
      accent3: '#a3e635',
      grid: '#1f1f1f',
    },
    fonts: { arabic: 'lalezar', latin: 'bebas-neue' },
    background: {
      type: 'particles',
      color: '#050505',
      particleColor: '#22d3ee',
      count: 50,
      seed: 'neon',
    },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.glitch',
    defaultTransition: 'zoom',
  },
  {
    id: 'lab',
    name: { fr: 'Laboratoire', ar: 'مختبر', en: 'Laboratory' },
    palette: {
      background: '#f8fafc',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      muted: '#475569',
      accent1: '#0284c7',
      accent2: '#0ea5e9',
      accent3: '#f59e0b',
      grid: '#cbd5e1',
    },
    fonts: { arabic: 'tajawal', latin: 'montserrat' },
    background: { type: 'texture', texture: 'grid', color: '#f8fafc' },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.slide',
    defaultTransition: 'slide',
  },
  {
    id: 'kinetic',
    name: { fr: 'Typographie cinétique', ar: 'طباعة حركية', en: 'Kinetic type' },
    palette: {
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      muted: '#9ca3af',
      accent1: '#facc15',
      accent2: '#f43f5e',
      accent3: '#38bdf8',
      grid: '#374151',
    },
    fonts: { arabic: 'changa', latin: 'bebas-neue' },
    background: { type: 'color', color: '#111827' },
    strokeStyle: 'clean',
    shapeShadow: false,
    defaultEnter: 'enter.pop',
    defaultTransition: 'slide',
  },
  {
    id: 'paper-cut',
    name: { fr: 'Papier découpé', ar: 'ورق مقصوص', en: 'Paper cut' },
    palette: {
      background: '#fef3c7',
      surface: '#fffbeb',
      text: '#7c2d12',
      muted: '#a16207',
      accent1: '#fb923c',
      accent2: '#65a30d',
      accent3: '#0ea5e9',
      grid: '#fde68a',
    },
    fonts: { arabic: 'el-messiri', latin: 'poppins' },
    background: { type: 'texture', texture: 'paper', color: '#fef3c7' },
    strokeStyle: 'clean',
    shapeShadow: true,
    defaultEnter: 'enter.pop',
    defaultTransition: 'flip',
  },
];

export const DEFAULT_THEME_ID = 'minimal-light';

/** Thème du projet, avec les couleurs modifiées par l'utilisateur. */
export const resolveTheme = (themeId: string, overrides: Readonly<Record<string, string>> = {}) => {
  const theme =
    THEMES.find((item) => item.id === themeId) ??
    THEMES.find((item) => item.id === DEFAULT_THEME_ID) ??
    (THEMES[0] as Theme);
  const palette = { ...theme.palette };
  for (const token of PALETTE_TOKENS) {
    const value = overrides[token];
    if (value) palette[token] = value;
  }
  return { ...theme, palette };
};

const THEME_PREFIX = 'theme.';

/** Couleur réelle : une référence « theme.accent1 » prend la couleur du thème. */
export const resolveColor = (value: string, theme: Theme): string => {
  if (!value.startsWith(THEME_PREFIX)) return value;
  const token = value.slice(THEME_PREFIX.length);
  return PALETTE_TOKENS.find((item) => item === token) ? theme.palette[token as PaletteToken] : value;
};

export const themeColorRef = (token: PaletteToken) => `${THEME_PREFIX}${token}`;
