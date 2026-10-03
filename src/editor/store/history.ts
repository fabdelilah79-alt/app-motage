import { useStore } from 'zustand';
import type { Project } from '../../shared/schema';
import { useEditorStore } from './editorStore';

let snapshot: Project | null | undefined;

/**
 * Début d'un geste continu (glisser, redimensionner…) : l'historique est mis en pause
 * pour que tout le geste ne compte que pour une seule étape d'annulation.
 */
export const beginInteraction = () => {
  if (snapshot !== undefined) return;
  snapshot = useEditorStore.getState().project;
  useEditorStore.temporal.getState().pause();
};

/** Fin du geste : une seule entrée « avant → après » est ajoutée à l'historique. */
export const endInteraction = () => {
  if (snapshot === undefined) return;
  const before = snapshot;
  snapshot = undefined;
  const after = useEditorStore.getState().project;
  useEditorStore.setState({ project: before });
  useEditorStore.temporal.getState().resume();
  if (after !== before) {
    useEditorStore.setState({ project: after });
  }
};

export const undo = () => useEditorStore.temporal.getState().undo();
export const redo = () => useEditorStore.temporal.getState().redo();

export const useHistoryAvailability = () => {
  const canUndo = useStore(useEditorStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useEditorStore.temporal, (state) => state.futureStates.length > 0);
  return { canUndo, canRedo };
};
