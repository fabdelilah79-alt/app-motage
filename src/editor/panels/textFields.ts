import type { TextElement } from '../../shared/schema';
import type { FieldDescriptor } from './fieldDescriptors';

/** Champs propres aux textes (le contenu riche a son propre éditeur). */
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
