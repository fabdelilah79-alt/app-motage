import { createContext, useContext } from 'react';
import type { Project } from '../shared/schema';

export type ProjectSettings = Pick<Project, 'digits'>;

/** Réglages du projet utiles au rendu des éléments (ex. chiffres des textes arabes). */
export const ProjectSettingsContext = createContext<ProjectSettings>({ digits: 'latin' });

export const useProjectSettings = (): ProjectSettings => useContext(ProjectSettingsContext);
