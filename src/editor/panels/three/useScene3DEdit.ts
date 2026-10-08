import type { Scene3DElement } from '../../../shared/schema';
import { useEditorStore } from '../../store/editorStore';

/** Modification d'une scène 3D (brouillon immer validé par le schéma). */
export const useScene3DEdit = (elementId: string) => {
  const updateElement = useEditorStore((state) => state.updateElement);
  return (recipe: (scene: Scene3DElement) => void) =>
    updateElement(elementId, (draft) => {
      if (draft.type === 'scene3d') recipe(draft);
    });
};
