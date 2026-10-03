import { createContext, useContext } from 'react';
import type { Asset } from '../shared/schema';

/** Médias du projet, accessibles à tous les éléments de la vidéo. */
export const ProjectAssetsContext = createContext<readonly Asset[]>([]);

export const useProjectAsset = (assetId: string): Asset | undefined =>
  useContext(ProjectAssetsContext).find((asset) => asset.id === assetId);
