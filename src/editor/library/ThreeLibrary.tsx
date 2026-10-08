import { Box, Grid3x3, Magnet, Orbit, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createScene3DElement, type Scene3DPreset } from '../../shared/threeFactories';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

const PRESETS: readonly { id: Scene3DPreset; Icon: typeof Box }[] = [
  { id: 'empty', Icon: Grid3x3 },
  { id: 'surface', Icon: Wind },
  { id: 'helix', Icon: Magnet },
  { id: 'field', Icon: Orbit },
  { id: 'solids', Icon: Box },
];

/** Scènes 3D toutes prêtes : repère vide, surface, hélice (particule chargée), champ, solides. */
export const ThreeLibrary = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addElement = useEditorStore((state) => state.addElement);
  const duration = scene?.durationInFrames ?? project.format.fps * 5;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400">{t('three.help')}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {PRESETS.map(({ id, Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`add-scene3d-${id}`}
            onClick={() => addElement(createScene3DElement(project.format, duration, id))}
            className="flex flex-col items-center gap-1 rounded-md border border-slate-700 bg-slate-800 p-2 text-center text-[11px] text-slate-300 hover:border-sky-400"
          >
            <Icon size={22} aria-hidden />
            {t(`three.presets.${id}`)}
          </button>
        ))}
      </div>
    </div>
  );
};
