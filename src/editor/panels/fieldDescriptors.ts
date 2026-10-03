import type { ImageElement, SceneElement, TextElement } from '../../shared/schema';

export type FieldValue = string | number;

/** Types de champs : « seconds » et « percent » sont convertis pour l'affichage. */
export type FieldKind = 'number' | 'seconds' | 'percent' | 'color' | 'select' | 'textarea';

export type FieldDescriptor<E> = {
  id: string;
  labelKey: string;
  tab: 'content' | 'style';
  kind: FieldKind;
  options?: readonly { value: string; labelKey: string }[];
  min?: number;
  max?: number;
  step?: number;
  get: (element: E) => FieldValue;
  set: (element: E, value: FieldValue) => void;
};

/**
 * Description des champs du panneau Propriétés, par type d'élément.
 * Chaque modification est ensuite validée par le schéma zod de l'élément (editorStore).
 */
export const COMMON_FIELDS: FieldDescriptor<SceneElement>[] = [
  {
    id: 'from',
    labelKey: 'fields.start',
    tab: 'content',
    kind: 'seconds',
    min: 0,
    step: 0.1,
    get: (element) => element.timing.from,
    set: (element, value) => {
      element.timing.from = Math.max(0, Number(value));
    },
  },
  {
    id: 'duration',
    labelKey: 'fields.duration',
    tab: 'content',
    kind: 'seconds',
    min: 0.1,
    step: 0.1,
    get: (element) => element.timing.duration,
    set: (element, value) => {
      element.timing.duration = Math.max(1, Number(value));
    },
  },
  ...(['x', 'y', 'width', 'height'] as const).map(
    (key): FieldDescriptor<SceneElement> => ({
      id: key,
      labelKey: `fields.${key}`,
      tab: 'style',
      kind: 'number',
      step: 1,
      get: (element) => element.transform[key],
      set: (element, value) => {
        element.transform[key] = Math.round(Number(value));
      },
    }),
  ),
  {
    id: 'rotation',
    labelKey: 'fields.rotation',
    tab: 'style',
    kind: 'number',
    step: 1,
    get: (element) => element.transform.rotation,
    set: (element, value) => {
      element.transform.rotation = Number(value);
    },
  },
  {
    id: 'opacity',
    labelKey: 'fields.opacity',
    tab: 'style',
    kind: 'percent',
    min: 0,
    max: 100,
    step: 5,
    get: (element) => element.transform.opacity,
    set: (element, value) => {
      element.transform.opacity = Math.min(1, Math.max(0, Number(value)));
    },
  },
];

export const TEXT_FIELDS: FieldDescriptor<TextElement>[] = [
  {
    id: 'lang',
    labelKey: 'fields.lang',
    tab: 'content',
    kind: 'select',
    options: [
      { value: 'fr', labelKey: 'langs.fr' },
      { value: 'ar', labelKey: 'langs.ar' },
      { value: 'en', labelKey: 'langs.en' },
    ],
    get: (element) => element.lang,
    set: (element, value) => {
      if (value === 'fr' || value === 'ar' || value === 'en') element.lang = value;
    },
  },
  {
    id: 'fontSize',
    labelKey: 'fields.fontSize',
    tab: 'style',
    kind: 'number',
    min: 8,
    step: 2,
    get: (element) => element.style.fontSize,
    set: (element, value) => {
      element.style.fontSize = Number(value);
    },
  },
  {
    id: 'fontWeight',
    labelKey: 'fields.fontWeight',
    tab: 'style',
    kind: 'select',
    options: [
      { value: '400', labelKey: 'fields.weightRegular' },
      { value: '700', labelKey: 'fields.weightBold' },
    ],
    get: (element) => String(element.style.fontWeight),
    set: (element, value) => {
      element.style.fontWeight = Number(value);
    },
  },
  {
    id: 'color',
    labelKey: 'fields.color',
    tab: 'style',
    kind: 'color',
    get: (element) => element.style.color,
    set: (element, value) => {
      element.style.color = String(value);
    },
  },
  {
    id: 'align',
    labelKey: 'fields.align',
    tab: 'style',
    kind: 'select',
    options: [
      { value: 'start', labelKey: 'fields.alignStart' },
      { value: 'center', labelKey: 'fields.alignCenter' },
      { value: 'end', labelKey: 'fields.alignEnd' },
    ],
    get: (element) => element.style.align,
    set: (element, value) => {
      if (value === 'start' || value === 'center' || value === 'end') element.style.align = value;
    },
  },
  {
    id: 'letterSpacing',
    labelKey: 'fields.letterSpacing',
    tab: 'style',
    kind: 'number',
    min: -0.2,
    max: 1,
    step: 0.01,
    get: (element) => element.style.letterSpacing,
    set: (element, value) => {
      element.style.letterSpacing = Number(value);
    },
  },
  {
    id: 'textTransform',
    labelKey: 'fields.textTransform',
    tab: 'style',
    kind: 'select',
    options: [
      { value: 'none', labelKey: 'fields.transformNone' },
      { value: 'uppercase', labelKey: 'fields.transformUppercase' },
    ],
    get: (element) => element.style.textTransform,
    set: (element, value) => {
      if (value === 'none' || value === 'uppercase') element.style.textTransform = value;
    },
  },
  {
    id: 'lineHeight',
    labelKey: 'fields.lineHeight',
    tab: 'style',
    kind: 'number',
    min: 0.8,
    step: 0.1,
    get: (element) => element.style.lineHeight,
    set: (element, value) => {
      element.style.lineHeight = Number(value);
    },
  },
];

export const IMAGE_FIELDS: FieldDescriptor<ImageElement>[] = [
  {
    id: 'fit',
    labelKey: 'fields.fit',
    tab: 'style',
    kind: 'select',
    options: [
      { value: 'contain', labelKey: 'fields.fitContain' },
      { value: 'cover', labelKey: 'fields.fitCover' },
    ],
    get: (element) => element.fit,
    set: (element, value) => {
      if (value === 'contain' || value === 'cover') element.fit = value;
    },
  },
];

/** Tous les champs d'un élément : communs + spécifiques à son type. */
export const fieldsFor = (element: SceneElement): FieldDescriptor<SceneElement>[] => {
  const specific =
    element.type === 'text'
      ? (TEXT_FIELDS as FieldDescriptor<SceneElement>[])
      : (IMAGE_FIELDS as FieldDescriptor<SceneElement>[]);
  return [...specific, ...COMMON_FIELDS];
};
