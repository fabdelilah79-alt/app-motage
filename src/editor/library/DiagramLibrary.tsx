import { useTranslation } from 'react-i18next';
import type { Lang } from '../../shared/schema';
import { createDiagramElement } from '../../shared/scienceFactories';
import { DIAGRAM_CATEGORIES, DIAGRAM_LIST } from '../../video/science/diagrams/registry';
import type { DiagramDefinition } from '../../video/science/diagrams/types';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

const PREVIEW_STYLE = {
  color: '#e2e8f0',
  accent: '#38bdf8',
  fill: '#334155',
  strokeWidth: 3,
  draw: undefined,
};

/** Aperçu d'un schéma : le même dessin que dans la vidéo, réduit. */
const DiagramPreview = ({ diagram }: { diagram: DiagramDefinition }) => {
  const { width, height } = diagram.size;
  const pad = 12;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
      className="h-10 w-14"
      aria-hidden
    >
      {diagram.render({ width, height, params: {}, style: PREVIEW_STYLE })}
    </svg>
  );
};

/** Bibliothèque de schémas paramétrables : mécanique, électricité, optique, divers. */
export const DiagramLibrary = () => {
  const { t, i18n } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const duration = scene?.durationInFrames ?? project.format.fps * 5;
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';

  return (
    <>
      {DIAGRAM_CATEGORIES.map((category) => (
        <section key={category} className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold text-slate-300">
            {t(`science.diagramCategories.${category}`)}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {DIAGRAM_LIST.filter((diagram) => diagram.category === category).map((diagram) => (
              <button
                key={diagram.id}
                type="button"
                data-testid={`add-diagram-${diagram.id}`}
                title={diagram.name[lang]}
                onClick={() =>
                  addElement(createDiagramElement(project.format, duration, diagram.id, diagram.size))
                }
                className="flex flex-col items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-1.5 text-center text-[10px] text-slate-300 hover:border-sky-400"
              >
                <DiagramPreview diagram={diagram} />
                {diagram.name[lang]}
              </button>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};
