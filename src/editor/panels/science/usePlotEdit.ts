import type { Plot2DElement } from '../../../shared/schema';
import { useEditorStore } from '../../store/editorStore';

/** Modification d'un repère (brouillon immer validé par le schéma). */
export const usePlotEdit = (elementId: string) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  return (recipe: (plot: Plot2DElement) => void) =>
    updateElement(elementId, (draft) => {
      if (draft.type === 'plot2d') recipe(draft);
    });
};
