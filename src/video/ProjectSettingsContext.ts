import { createContext, useContext } from 'react';
import type { Project } from '../shared/schema';

export type ProjectSettings = Pick<Project, 'digits' | 'defaultLang'> &
  Partial<Pick<Project, 'subtitleStyle'>> & {
    /** Échelle d'affichage de l'aperçu (absente pendant l'export). */
    previewScale?: number;
  };

/** Réglages du projet utiles au rendu des éléments (ex. chiffres des textes arabes). */
export const ProjectSettingsContext = createContext<ProjectSettings>({
  digits: 'latin',
  defaultLang: 'fr',
});

export const useProjectSettings = (): ProjectSettings => useContext(ProjectSettingsContext);
