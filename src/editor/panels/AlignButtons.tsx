import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProjectFormat, SceneElement } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { alignElement, ALIGNMENTS, type Alignment } from './alignment';

const ICONS: Record<Alignment, typeof AlignStartVertical> = {
  left: AlignStartVertical,
  centerX: AlignCenterVertical,
  right: AlignEndVertical,
  top: AlignStartHorizontal,
  centerY: AlignCenterHorizontal,
  bottom: AlignEndHorizontal,
};

/** Place l'élément d'un clic : à gauche, au centre, à droite, en haut, au milieu, en bas. */
export const AlignButtons = ({ element, format }: { element: SceneElement; format: ProjectFormat }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-slate-400">{t('align.title')}</p>
      <div className="flex gap-1" dir="ltr">
        {ALIGNMENTS.map((alignment) => {
          const Icon = ICONS[alignment];
          return (
            <button
              key={alignment}
              type="button"
              data-testid={`align-${alignment}`}
              title={t(`align.${alignment}`)}
              aria-label={t(`align.${alignment}`)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:border-sky-400"
              onClick={() =>
                updateElement(element.id, (draft) => {
                  draft.transform = alignElement(draft.transform, format, alignment);
                })
              }
            >
              <Icon size={16} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
};
