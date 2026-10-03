import type { FC } from 'react';
import type { ElementType, SceneElement } from '../../shared/schema';
import { ImageElementView } from './ImageElementView';
import { TextElementView } from './TextElementView';

type ElementViewRegistry = {
  [Type in ElementType]: FC<{ element: Extract<SceneElement, { type: Type }> }>;
};

/** Registre des composants de rendu : un composant par type d'élément. */
export const ELEMENT_VIEWS: ElementViewRegistry = {
  text: TextElementView,
  image: ImageElementView,
};
