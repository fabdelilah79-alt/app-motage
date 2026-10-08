import { FORMAT_PRESETS, type FormatPresetId } from './formats';
import {
  CURRENT_SCHEMA_VERSION,
  type Lang,
  type Project,
  type ProjectFormat,
  type Scene,
  type TextElement,
} from './schema';

/** Générateur d'identifiants (remplaçable dans les tests). */
export type IdGenerator = () => string;

export const randomId: IdGenerator = () => crypto.randomUUID().slice(0, 8);

export const DEFAULT_SCENE_SECONDS = 5;

const DEFAULT_TEXT: Record<Lang, string> = {
  fr: 'Votre texte ici',
  ar: 'اكتب نصك هنا',
  en: 'Your text here',
};

export const createScene = (format: ProjectFormat, newId: IdGenerator = randomId): Scene => ({
  id: `scene-${newId()}`,
  name: '',
  durationInFrames: DEFAULT_SCENE_SECONDS * format.fps,
  // Fond du thème du projet : il change quand on change de thème.
  background: { type: 'theme' },
  elements: [],
  camera: [],
  subtitles: [],
});

type NewProjectOptions = {
  id: string;
  title: string;
  formatId: FormatPresetId;
  defaultLang: Lang;
  /** 30 (par défaut) ou 60 images par seconde. */
  fps?: 30 | 60;
};

export const createProject = (options: NewProjectOptions, newId: IdGenerator = randomId) => {
  const format = { ...FORMAT_PRESETS[options.formatId], fps: options.fps ?? 30 };
  const project: Project = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id: options.id,
    title: options.title,
    format,
    defaultLang: options.defaultLang,
    digits: 'latin',
    assets: [],
    themeId: 'minimal-light',
    themeOverrides: {},
    audioTracks: [],
    subtitleStyle: { burnIn: false, position: 'bottom', fontSize: 44, background: true },
    scenes: [createScene(format, newId)],
  };
  return project;
};

/** Texte centré, visible pendant toute la scène, avec un fondu d'apparition. */
export const createTextElement = (
  format: ProjectFormat,
  sceneDuration: number,
  lang: Lang,
  newId: IdGenerator = randomId,
): TextElement => ({
  id: `text-${newId()}`,
  type: 'text',
  name: '',
  locked: false,
  hidden: false,
  lang,
  direction: 'auto',
  transform: {
    x: Math.round(format.width * 0.1),
    y: Math.round(format.height * 0.4),
    width: Math.round(format.width * 0.8),
    height: Math.round(format.height * 0.2),
    rotation: 0,
    scale: 1,
    opacity: 1,
  },
  timing: { from: 0, duration: sceneDuration },
  animations: { enter: enterFade(), emphasis: [] },
  content: [{ kind: 'text', text: DEFAULT_TEXT[lang] }],
  style: {
    fontSize: Math.round(format.height / 15),
    fontWeight: 700,
    color: 'theme.text',
    align: 'center',
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
    effects: {},
  },
});

/** Apparition par défaut d'un nouvel élément : fondu de 0,5 s. */
export const enterFade = () => ({
  presetId: 'enter.fade',
  duration: 15,
  delay: 0,
  easing: 'smooth' as const,
  params: {},
  repeat: 1,
});
