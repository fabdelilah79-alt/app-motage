import { useMemo } from 'react';
import { computeProjectDuration } from '../../shared/timeline';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';

/**
 * Projet montré par le lecteur : la scène sélectionnée seule (mode édition)
 * ou toute la vidéo avec ses transitions (« Voir toute la vidéo »).
 */
export const usePreviewProject = () => {
  const project = useProject();
  const scene = useCurrentScene();
  const mode = useEditorStore((state) => state.previewMode);

  return useMemo(() => {
    if (mode === 'full' || !scene) {
      return { project, durationInFrames: computeProjectDuration(project), mode: 'full' as const };
    }
    const sceneOnly = { ...project, scenes: [{ ...scene, transitionIn: undefined }] };
    return { project: sceneOnly, durationInFrames: scene.durationInFrames, mode: 'scene' as const };
  }, [project, scene, mode]);
};
