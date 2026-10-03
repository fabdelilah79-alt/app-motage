import { produce } from 'immer';
import { describe, expect, it } from 'vitest';
import {
  duplicateElement,
  duplicateScene,
  moveScene,
  removeScene,
  setSceneDuration,
} from '../../src/editor/store/projectMutations';
import { createTextElement } from '../../src/shared/factories';
import { parseProject } from '../../src/shared/schema';
import { makeProjectInput } from './fixtures';

let counter = 0;
const newId = () => `n${++counter}`;

const project = parseProject(
  makeProjectInput({
    scenes: [
      { id: 'a', durationInFrames: 60 },
      { id: 'b', durationInFrames: 90 },
      { id: 'c', durationInFrames: 30 },
    ],
  }),
);
const ids = (value: typeof project) => value.scenes.map((scene) => scene.id);
const firstScene = (() => {
  const scene = project.scenes[0];
  if (!scene) throw new Error('scène attendue');
  return scene;
})();

const textAt = (id: string, from: number, duration: number) => ({
  ...createTextElement(project.format, 60, 'fr', () => id),
  timing: { from, duration },
});

describe('modifications du projet', () => {
  it('duplique une scène juste après elle, avec de nouveaux identifiants', () => {
    const withText = produce(project, (draft) => {
      draft.scenes[0]?.elements.push(createTextElement(draft.format, 60, 'fr', () => 'x'));
    });
    const result = produce(withText, (draft) => {
      duplicateScene(draft, 'a', newId);
    });
    expect(result.scenes).toHaveLength(4);
    expect(result.scenes[1]?.id).not.toBe('a');
    expect(result.scenes[1]?.elements[0]?.id).not.toBe(withText.scenes[0]?.elements[0]?.id);
    expect(withText.scenes).toHaveLength(3);
  });

  it('supprime une scène mais jamais la dernière', () => {
    expect(ids(produce(project, (draft) => void removeScene(draft, 'b')))).toEqual(['a', 'c']);
    const single = parseProject(makeProjectInput());
    expect(produce(single, (draft) => void removeScene(draft, 'scene-1')).scenes).toHaveLength(1);
  });

  it('réordonne les scènes', () => {
    expect(ids(produce(project, (draft) => moveScene(draft, 0, 2)))).toEqual(['b', 'c', 'a']);
    expect(ids(produce(project, (draft) => moveScene(draft, 2, 0)))).toEqual(['c', 'a', 'b']);
  });

  it('adapte les éléments quand la durée de la scène change', () => {
    const scene = { ...firstScene, elements: [textAt('plein', 0, 60), textAt('court', 50, 5)] };
    const longer = produce(scene, (draft) => setSceneDuration(draft, 120));
    expect(longer.elements.map((element) => element.timing)).toEqual([
      { from: 0, duration: 120 },
      { from: 50, duration: 5 },
    ]);
    const shorter = produce(scene, (draft) => setSceneDuration(draft, 30));
    expect(shorter.elements.map((element) => element.timing)).toEqual([
      { from: 0, duration: 30 },
      { from: 29, duration: 1 },
    ]);
  });

  it('duplique un élément en le décalant', () => {
    const text = createTextElement(project.format, 60, 'ar', () => 'orig');
    const scene = { ...firstScene, elements: [text] };
    const result = produce(scene, (draft) => void duplicateElement(draft, text.id, newId));
    expect(result.elements).toHaveLength(2);
    expect(result.elements[1]?.transform.x).toBe(text.transform.x + 40);
  });
});
