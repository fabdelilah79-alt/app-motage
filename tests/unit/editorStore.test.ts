import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '../../src/editor/store/editorStore';
import { beginInteraction, endInteraction, redo, undo } from '../../src/editor/store/history';
import { createTextElement } from '../../src/shared/factories';
import { parseProject } from '../../src/shared/schema';
import { makeProjectInput } from './fixtures';

const store = () => useEditorStore.getState();
const history = () => useEditorStore.temporal.getState();

describe('état de l’éditeur et annuler / rétablir', () => {
  beforeEach(() => {
    store().loadProject(parseProject(makeProjectInput()));
  });

  it('charge un projet sans historique et sélectionne la première scène', () => {
    expect(history().pastStates).toHaveLength(0);
    expect(store().selection).toEqual({ sceneId: 'scene-1', elementId: null });
  });

  it('annule puis rétablit l’ajout d’une scène', () => {
    store().addScene();
    expect(store().project?.scenes).toHaveLength(2);
    undo();
    expect(store().project?.scenes).toHaveLength(1);
    redo();
    expect(store().project?.scenes).toHaveLength(2);
  });

  it('ne met pas la sélection dans l’historique', () => {
    store().selectElement('inconnu');
    expect(history().pastStates).toHaveLength(0);
  });

  it('refuse une modification qui rendrait l’élément invalide', () => {
    const format = store().project?.format ?? { width: 1920, height: 1080, fps: 30 };
    store().addElement(createTextElement(format, 150, 'fr', () => 'a'));
    const id = store().selection.elementId ?? '';
    store().updateElement(id, (element) => {
      element.transform.width = -5;
    });
    const element = store().project?.scenes[0]?.elements[0];
    expect(element?.transform.width).toBeGreaterThan(0);
  });

  it('regroupe un geste continu en une seule étape d’annulation', () => {
    const format = store().project?.format ?? { width: 1920, height: 1080, fps: 30 };
    store().addElement(createTextElement(format, 150, 'fr', () => 'b'));
    const id = store().selection.elementId ?? '';
    const before = history().pastStates.length;

    beginInteraction();
    for (let x = 1; x <= 20; x++) {
      store().updateElement(id, (element) => {
        element.transform.x = x;
      });
    }
    endInteraction();

    expect(history().pastStates.length).toBe(before + 1);
    expect(store().project?.scenes[0]?.elements[0]?.transform.x).toBe(20);
    undo();
    expect(store().project?.scenes[0]?.elements[0]?.transform.x).toBe(192);
  });
});
