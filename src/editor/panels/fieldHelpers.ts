import type { FieldDescriptor, FieldValue } from './fieldDescriptors';

type Numeric = { min?: number; max?: number; step?: number };

/** Champ numérique lisant et écrivant une propriété (fabrique de descripteurs). */
export const numberField = <E>(
  id: string,
  labelKey: string,
  get: (element: E) => number,
  set: (element: E, value: number) => void,
  options: Numeric & { tab?: 'content' | 'style'; kind?: 'number' | 'percent' | 'seconds' } = {},
): FieldDescriptor<E> => ({
  id,
  labelKey,
  tab: options.tab ?? 'style',
  kind: options.kind ?? 'number',
  min: options.min,
  max: options.max,
  step: options.step,
  get,
  set: (element, value) => set(element, Number(value)),
});

export const booleanField = <E>(
  id: string,
  labelKey: string,
  get: (element: E) => boolean,
  set: (element: E, value: boolean) => void,
  tab: 'content' | 'style' = 'style',
): FieldDescriptor<E> => ({
  id,
  labelKey,
  tab,
  kind: 'boolean',
  get,
  set: (element, value) => set(element, value === true),
});

/** Liste de choix : seules les valeurs proposées sont acceptées. */
export const selectField = <E, V extends string>(
  id: string,
  labelKey: string,
  values: readonly V[],
  labelPrefix: string,
  get: (element: E) => V,
  set: (element: E, value: V) => void,
  tab: 'content' | 'style' = 'style',
): FieldDescriptor<E> => ({
  id,
  labelKey,
  tab,
  kind: 'select',
  options: values.map((value) => ({ value, labelKey: `${labelPrefix}.${value}` })),
  get,
  set: (element, value: FieldValue) => {
    const chosen = values.find((item) => item === value);
    if (chosen !== undefined) set(element, chosen);
  },
});

export const colorField = <E>(
  id: string,
  labelKey: string,
  get: (element: E) => string,
  set: (element: E, value: string) => void,
): FieldDescriptor<E> => ({
  id,
  labelKey,
  tab: 'style',
  kind: 'color',
  get,
  set: (element, value) => set(element, String(value)),
});

/** Zone de texte (contenu). */
export const textField = <E>(
  id: string,
  labelKey: string,
  get: (element: E) => string,
  set: (element: E, value: string) => void,
): FieldDescriptor<E> => ({
  id,
  labelKey,
  tab: 'content',
  kind: 'textarea',
  get,
  set: (element, value) => set(element, String(value)),
});
