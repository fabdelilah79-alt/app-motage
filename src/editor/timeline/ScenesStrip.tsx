import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { cn } from '../ui/cn';
import { SceneCard } from './SceneCard';

/** Bande des scènes : vignettes à réordonner par glisser-déposer, transitions, ajout. */
export const ScenesStrip = () => {
  const { t } = useTranslation();
  const project = useProject();
  const current = useCurrentScene();
  const addScene = useEditorStore((state) => state.addScene);
  const moveScene = useEditorStore((state) => state.moveScene);
  const selectScene = useEditorStore((state) => state.selectScene);
  // Un petit déplacement est nécessaire avant de glisser : un simple clic sélectionne la scène.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ids = project.scenes.map((scene) => scene.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    moveScene(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 px-3 py-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          {project.scenes.map((scene, index) => (
            <Fragment key={scene.id}>
              {index > 0 ? (
                <button
                  type="button"
                  title={t(`scene.transitions.${scene.transitionIn?.type ?? 'none'}`)}
                  aria-label={t('scene.editTransition')}
                  onClick={() => selectScene(scene.id)}
                  className={cn(
                    'shrink-0 rounded-full p-1.5 hover:bg-slate-700',
                    scene.transitionIn && scene.transitionIn.type !== 'none'
                      ? 'text-sky-300'
                      : 'text-slate-600',
                  )}
                >
                  <ArrowRightLeft size={14} aria-hidden />
                </button>
              ) : null}
              <SceneCard
                project={project}
                scene={scene}
                index={index}
                selected={scene.id === current?.id}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        data-testid="add-scene"
        onClick={addScene}
        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-700 text-xs text-slate-400 hover:border-sky-400 hover:text-sky-300"
      >
        <Plus size={18} aria-hidden />
        {t('scene.add')}
      </button>
    </div>
  );
};
