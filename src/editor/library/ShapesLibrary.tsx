import { useTranslation } from 'react-i18next';
import { createIconElement, createShapeElement } from '../../shared/mediaFactories';
import { shapeKindSchema, type ShapeKind } from '../../shared/schema';
import { ICON_CATALOG, ICON_IDS } from '../../video/media/iconCatalog';
import { shapePath } from '../../video/media/shapePaths';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

const SHAPES: readonly ShapeKind[] = shapeKindSchema.options;

/** Aperçu d'une forme dans la bibliothèque (même tracé que dans la vidéo). */
const ShapePreview = ({ shape }: { shape: ShapeKind }) => {
  const { d, transform } = shapePath(shape, 48, 36, shape === 'star' ? 5 : 6, 3);
  const open = shape === 'line' || shape === 'arrow' || shape === 'curvedArrow';
  return (
    <svg viewBox="0 0 48 36" className="h-9 w-12" aria-hidden>
      <path
        d={d}
        transform={transform}
        fill={open ? 'none' : '#38bdf8'}
        stroke="#e2e8f0"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Formes (rectangle, cercle, flèches, bulle…) et icônes de physique-chimie. */
export const ShapesLibrary = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const duration = scene?.durationInFrames ?? project.format.fps * 5;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-slate-300">{t('shapes.title')}</h3>
      <div className="grid grid-cols-3 gap-1.5">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            type="button"
            data-testid={`add-shape-${shape}`}
            title={t(`shapes.kinds.${shape}`)}
            onClick={() => addElement(createShapeElement(project.format, duration, shape))}
            className="flex flex-col items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-1.5 text-[10px] text-slate-300 hover:border-sky-400"
          >
            <ShapePreview shape={shape} />
            {t(`shapes.kinds.${shape}`)}
          </button>
        ))}
      </div>
      <h3 className="text-xs font-semibold text-slate-300">{t('shapes.icons')}</h3>
      <div className="grid grid-cols-5 gap-1">
        {ICON_IDS.map((iconId) => {
          const Icon = ICON_CATALOG[iconId];
          return Icon ? (
            <button
              key={iconId}
              type="button"
              data-testid={`add-icon-${iconId}`}
              onClick={() => addElement(createIconElement(project.format, duration, iconId))}
              className="flex aspect-square items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:border-sky-400"
            >
              <Icon size={20} aria-hidden />
            </button>
          ) : null;
        })}
      </div>
    </div>
  );
};
