import { ELECTRICITY } from './electricity';
import { MECHANICS } from './mechanics';
import { MISC } from './misc';
import { OPTICS } from './optics';
import type { DiagramCategory, DiagramDefinition } from './types';

/** Bibliothèque de schémas paramétrables, dans l'ordre des menus. */
export const DIAGRAM_LIST: readonly DiagramDefinition[] = [
  ...MECHANICS,
  ...ELECTRICITY,
  ...OPTICS,
  ...MISC,
];

export const DIAGRAM_CATEGORIES: readonly DiagramCategory[] = [
  'mechanics',
  'electricity',
  'optics',
  'misc',
];

export const getDiagram = (id: string): DiagramDefinition | undefined =>
  DIAGRAM_LIST.find((diagram) => diagram.id === id);
