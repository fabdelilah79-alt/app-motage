import type { SceneElement } from '../../shared/schema';
import { ELEMENT_FIELDS } from './mediaFields';

export type FieldValue = string | number | boolean;

/** Types de champs : « seconds » et « percent » sont convertis pour l'affichage. */
export type FieldKind =
  | 'number'
  | 'seconds'
  | 'percent'
  | 'color'
  | 'select'
  | 'textarea'
  | 'boolean';

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

/** Tous les champs d'un élément : spécifiques à son type, puis communs. */
export const fieldsFor = (element: SceneElement): FieldDescriptor<SceneElement>[] => {
  const specific = ELEMENT_FIELDS[element.type] as FieldDescriptor<SceneElement>[];
  return [...specific, ...COMMON_FIELDS];
};
