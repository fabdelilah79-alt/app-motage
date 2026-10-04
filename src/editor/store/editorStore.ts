import { temporal } from 'zundo';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createScene, randomId } from '../../shared/factories';
import {
  projectSchema,
  sceneElementSchema,
  sceneSchema,
  type Asset,
  type Project,
  type Scene,
  type SceneElement,
} from '../../shared/schema';
import * as mutations from './projectMutations';

export type Selection = { sceneId: string | null; elementId: string | null };
export type PreviewMode = 'scene' | 'full';

type EditorState = {
  project: Project | null;
  selection: Selection;
  previewMode: PreviewMode;
  clipboard: SceneElement | null;
  loadProject: (project: Project) => void;
  closeProject: () => void;
  setPreviewMode: (mode: PreviewMode) => void;
  selectScene: (sceneId: string) => void;
  selectElement: (elementId: string | null) => void;
  renameProject: (title: string) => void;
  /** Modification libre du projet, validée par le schéma (ignorée si invalide). */
  updateProject: (recipe: (project: Project) => void) => void;
  setDigits: (digits: Project['digits']) => void;
  addScene: () => void;
  duplicateScene: (sceneId: string) => void;
  removeScene: (sceneId: string) => void;
  moveScene: (fromIndex: number, toIndex: number) => void;
  updateScene: (sceneId: string, recipe: (scene: Scene) => void) => void;
  setSceneDuration: (sceneId: string, frames: number) => void;
  addElement: (element: SceneElement) => void;
  updateElement: (elementId: string, recipe: (element: SceneElement) => void) => void;
  removeElement: (elementId: string) => void;
  duplicateElement: (elementId: string) => void;
  copyElement: (elementId: string) => void;
  pasteElement: () => void;
  addAsset: (asset: Asset) => void;
};

/** Scène affichée : celle sélectionnée, sinon la première. */
export const currentSceneOf = (
  project: Project | null,
  selection: Selection,
): Scene | undefined =>
  project?.scenes.find((scene) => scene.id === selection.sceneId) ?? project?.scenes[0];

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => {
      /** Applique `recipe` à la scène courante (brouillon immer). */
      const withCurrentScene = (recipe: (scene: Scene, state: EditorState) => void) =>
        set((state) => {
          const scene = currentSceneOf(state.project, state.selection);
          if (scene) {
            recipe(scene, state);
          }
        });

      return {
        project: null,
        selection: { sceneId: null, elementId: null },
        previewMode: 'scene',
        clipboard: null,

        loadProject: (project) => {
          set({ project, selection: { sceneId: project.scenes[0]?.id ?? null, elementId: null } });
          useEditorStore.temporal.getState().clear();
        },
        closeProject: () => {
          set({ project: null, selection: { sceneId: null, elementId: null } });
          useEditorStore.temporal.getState().clear();
        },
        setPreviewMode: (mode) => set({ previewMode: mode }),
        selectScene: (sceneId) => set({ selection: { sceneId, elementId: null } }),
        selectElement: (elementId) =>
          set((state) => {
            state.selection.elementId = elementId;
          }),

        renameProject: (title) =>
          set((state) => {
            if (state.project && title.trim()) {
              state.project.title = title;
            }
          }),

        updateProject: (recipe) =>
          set((state) => {
            if (!state.project) return;
            const candidate = mutations.cloneDeep(state.project);
            recipe(candidate);
            const parsed = projectSchema.safeParse(candidate);
            if (parsed.success) state.project = parsed.data;
          }),
        setDigits: (digits) =>
          set((state) => {
            if (state.project) state.project.digits = digits;
          }),

        addScene: () =>
          set((state) => {
            if (!state.project) return;
            const scene = createScene(state.project.format);
            mutations.insertScene(state.project, scene, state.selection.sceneId);
            state.selection = { sceneId: scene.id, elementId: null };
          }),
        duplicateScene: (sceneId) =>
          set((state) => {
            if (!state.project) return;
            const copy = mutations.duplicateScene(state.project, sceneId, randomId);
            if (copy) state.selection = { sceneId: copy.id, elementId: null };
          }),
        removeScene: (sceneId) =>
          set((state) => {
            if (!state.project) return;
            const index = mutations.sceneIndex(state.project, sceneId);
            if (mutations.removeScene(state.project, sceneId)) {
              const next = state.project.scenes[Math.max(0, index - 1)];
              state.selection = { sceneId: next?.id ?? null, elementId: null };
            }
          }),
        moveScene: (fromIndex, toIndex) =>
          set((state) => {
            if (state.project) mutations.moveScene(state.project, fromIndex, toIndex);
          }),
        updateScene: (sceneId, recipe) =>
          set((state) => {
            const index = state.project ? mutations.sceneIndex(state.project, sceneId) : -1;
            const scene = state.project?.scenes[index];
            if (!state.project || !scene) return;
            const candidate = mutations.cloneDeep(scene);
            recipe(candidate);
            const parsed = sceneSchema.safeParse(candidate);
            if (parsed.success) state.project.scenes[index] = parsed.data;
          }),
        setSceneDuration: (sceneId, frames) =>
          get().updateScene(sceneId, (scene) => mutations.setSceneDuration(scene, frames)),

        addElement: (element) =>
          withCurrentScene((scene, state) => {
            scene.elements.push(element);
            state.selection = { sceneId: scene.id, elementId: element.id };
          }),
        updateElement: (elementId, recipe) =>
          withCurrentScene((scene) => {
            const index = scene.elements.findIndex((element) => element.id === elementId);
            const element = scene.elements[index];
            if (!element) return;
            const candidate = mutations.cloneDeep(element);
            recipe(candidate);
            // Une modification qui rendrait l'élément invalide (schéma zod) est ignorée.
            const parsed = sceneElementSchema.safeParse(candidate);
            if (parsed.success) scene.elements[index] = parsed.data;
          }),
        removeElement: (elementId) =>
          withCurrentScene((scene, state) => {
            scene.elements = scene.elements.filter((element) => element.id !== elementId);
            if (state.selection.elementId === elementId) state.selection.elementId = null;
          }),
        duplicateElement: (elementId) =>
          withCurrentScene((scene, state) => {
            const copy = mutations.duplicateElement(scene, elementId, randomId);
            if (copy) state.selection.elementId = copy.id;
          }),
        copyElement: (elementId) => {
          const { project, selection } = get();
          const element = currentSceneOf(project, selection)?.elements.find(
            (item) => item.id === elementId,
          );
          if (element) set({ clipboard: mutations.cloneDeep(element) });
        },
        pasteElement: () =>
          withCurrentScene((scene, state) => {
            const clipboard = state.clipboard;
            if (!clipboard) return;
            const copy = mutations.cloneDeep(clipboard);
            copy.id = `${clipboard.type}-${randomId()}`;
            scene.elements.push(copy);
            state.selection.elementId = copy.id;
          }),

        addAsset: (asset) =>
          set((state) => {
            state.project?.assets.push(asset);
          }),
      };
    }),
    {
      // Seul le projet entre dans l'historique (pas la sélection ni l'affichage).
      partialize: (state) => ({ project: state.project }),
      equality: (past, current) => past.project === current.project,
      limit: 100,
    },
  ),
);
