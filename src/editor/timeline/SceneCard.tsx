import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Project, Scene } from '../../shared/schema';
import { formatSeconds } from '../../shared/time';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../ui/cn';
import { SceneThumbnail } from './SceneThumbnail';

type Props = { project: Project; scene: Scene; index: number; selected: boolean };

/** Vignette déplaçable d'une scène, avec dupliquer / supprimer quand elle est sélectionnée. */
export const SceneCard = ({ project, scene, index, selected }: Props) => {
  const { t, i18n } = useTranslation();
  const selectScene = useEditorStore((state) => state.selectScene);
  const duplicateScene = useEditorStore((state) => state.duplicateScene);
  const removeScene = useEditorStore((state) => state.removeScene);
  const sortable = useSortable({ id: scene.id });
  const dragStyle = {
    transform: CSS.Translate.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={dragStyle}
      className={cn(
        'group relative shrink-0 cursor-pointer rounded-md border-2 bg-slate-800 p-1',
        selected ? 'border-sky-400' : 'border-transparent hover:border-slate-600',
        sortable.isDragging && 'z-10 opacity-70',
      )}
      data-testid="scene-card"
      onClick={() => selectScene(scene.id)}
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <SceneThumbnail project={project} scene={scene} width={120} />
      <div className="mt-1 flex items-center justify-between gap-1 px-0.5 text-[11px] text-slate-300">
        <span className="truncate">{scene.name || t('scene.title', { number: index + 1 })}</span>
        <span className="text-slate-500" dir="ltr">
          {formatSeconds(scene.durationInFrames, project.format.fps, i18n.language)}
        </span>
      </div>
      {selected ? (
        <div className="absolute end-1.5 top-1.5 flex gap-1">
          <button
            type="button"
            className="rounded bg-slate-900/80 p-1 hover:bg-slate-700"
            aria-label={t('scene.duplicate')}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              duplicateScene(scene.id);
            }}
          >
            <Copy size={12} aria-hidden />
          </button>
          {project.scenes.length > 1 ? (
            <button
              type="button"
              className="rounded bg-slate-900/80 p-1 hover:bg-rose-700"
              aria-label={t('scene.delete')}
              data-testid="delete-scene"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                removeScene(scene.id);
              }}
            >
              <Trash2 size={12} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
