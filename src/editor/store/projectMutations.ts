import { current, isDraft } from 'immer';
import type { IdGenerator } from '../../shared/factories';
import type { Project, Scene, SceneElement } from '../../shared/schema';

/**
 * Modifications du projet, écrites comme des mutations (utilisées dans des brouillons immer).
 * Fonctions pures du point de vue de l'état : testables avec `produce`.
 */

/** Copie profonde, y compris d'un brouillon immer. */
export const cloneDeep = <T>(value: T): T =>
  structuredClone(isDraft(value) ? current(value) : value);

export const sceneIndex = (project: Project, sceneId: string): number =>
  project.scenes.findIndex((scene) => scene.id === sceneId);

/** Insère une scène après `afterSceneId` (ou à la fin). */
export const insertScene = (project: Project, scene: Scene, afterSceneId?: string | null) => {
  const index = afterSceneId ? sceneIndex(project, afterSceneId) : -1;
  project.scenes.splice(index >= 0 ? index + 1 : project.scenes.length, 0, scene);
};

const withNewElementId = (element: SceneElement, newId: IdGenerator): SceneElement => ({
  ...cloneDeep(element),
  id: `${element.type}-${newId()}`,
});

export const duplicateScene = (project: Project, sceneId: string, newId: IdGenerator) => {
  const scene = project.scenes[sceneIndex(project, sceneId)];
  if (!scene) {
    return undefined;
  }
  const copy: Scene = {
    ...cloneDeep(scene),
    id: `scene-${newId()}`,
    elements: scene.elements.map((element) => withNewElementId(element, newId)),
  };
  insertScene(project, copy, sceneId);
  return copy;
};

/** Supprime une scène ; la dernière scène restante ne peut pas être supprimée. */
export const removeScene = (project: Project, sceneId: string): boolean => {
  const index = sceneIndex(project, sceneId);
  if (index < 0 || project.scenes.length <= 1) {
    return false;
  }
  project.scenes.splice(index, 1);
  return true;
};

export const moveScene = (project: Project, fromIndex: number, toIndex: number) => {
  const [scene] = project.scenes.splice(fromIndex, 1);
  if (scene) {
    project.scenes.splice(Math.max(0, Math.min(toIndex, project.scenes.length)), 0, scene);
  }
};

/**
 * Change la durée d'une scène : les éléments qui duraient jusqu'à la fin suivent la nouvelle fin,
 * les autres sont raccourcis s'ils dépassent.
 */
export const setSceneDuration = (scene: Scene, duration: number) => {
  const previous = scene.durationInFrames;
  const next = Math.max(1, Math.round(duration));
  scene.durationInFrames = next;
  for (const element of scene.elements) {
    const { timing } = element;
    if (timing.from + timing.duration === previous) {
      timing.duration = next - timing.from;
    }
    timing.from = Math.min(timing.from, next - 1);
    timing.duration = Math.max(1, Math.min(timing.duration, next - timing.from));
  }
};

/** Duplique un élément juste au-dessus de l'original, légèrement décalé. */
export const duplicateElement = (
  scene: Scene,
  elementId: string,
  newId: IdGenerator,
  offset = 40,
) => {
  const index = scene.elements.findIndex((element) => element.id === elementId);
  const original = scene.elements[index];
  if (!original) {
    return undefined;
  }
  const copy = withNewElementId(original, newId);
  copy.transform.x += offset;
  copy.transform.y += offset;
  scene.elements.splice(index + 1, 0, copy);
  return copy;
};
