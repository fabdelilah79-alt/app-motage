import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject, useSelectedElement } from '../store/selectors';
import { ElementProperties } from './ElementProperties';
import { SceneProperties } from './SceneProperties';

/** Panneau de droite : propriétés de l'élément sélectionné, sinon de la scène. */
export const PropertiesPanel = () => {
  const project = useProject();
  const scene = useCurrentScene();
  const element = useSelectedElement();
  const sceneIndex = useEditorStore((state) =>
    scene ? (state.project?.scenes.findIndex((item) => item.id === scene.id) ?? 0) : 0,
  );
  const { fps } = project.format;

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-s border-slate-800 bg-slate-900"
      data-testid="properties-panel"
    >
      {element ? (
        <ElementProperties key={element.id} element={element} fps={fps} />
      ) : scene ? (
        <SceneProperties key={scene.id} scene={scene} index={sceneIndex} fps={fps} />
      ) : null}
    </aside>
  );
};
