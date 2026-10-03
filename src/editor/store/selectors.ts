import type { Project, Scene, SceneElement } from '../../shared/schema';
import { currentSceneOf, useEditorStore } from './editorStore';

/** Projet ouvert (les écrans d'édition ne s'affichent que si un projet est chargé). */
export const useProject = (): Project => {
  const project = useEditorStore((state) => state.project);
  if (!project) {
    throw new Error('Aucun projet ouvert');
  }
  return project;
};

export const useCurrentScene = (): Scene | undefined =>
  useEditorStore((state) => currentSceneOf(state.project, state.selection));

export const useSelectedElement = (): SceneElement | undefined =>
  useEditorStore((state) => {
    const scene = currentSceneOf(state.project, state.selection);
    return scene?.elements.find((element) => element.id === state.selection.elementId);
  });
