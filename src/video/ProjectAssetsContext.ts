import { createContext, useContext } from 'react';
import type { Asset } from '../shared/schema';

export type ProjectAssets = {
  assets: readonly Asset[];
  projectId: string;
  /** Adresse du serveur local pour les fichiers importés ('' = même origine, via l'éditeur). */
  filesBaseUrl: string;
};

/** Médias du projet, accessibles à tous les éléments de la vidéo. */
export const ProjectAssetsContext = createContext<ProjectAssets>({
  assets: [],
  projectId: '',
  filesBaseUrl: '',
});

export const useProjectAssets = (): ProjectAssets => useContext(ProjectAssetsContext);
