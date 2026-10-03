import { staticFile } from 'remotion';
import type { Asset } from '../../shared/schema';

const ABSOLUTE_URL = /^(https?:|data:|blob:)/;

type FilesLocation = { projectId: string; filesBaseUrl: string };

/**
 * URL d'un média :
 * - URL complète : conservée telle quelle ;
 * - fichier du projet : servi par le serveur local (/files/<projet>/<chemin>), même URL
 *   pour l'aperçu et pour le rendu ;
 * - fichier public : livré avec l'application (staticFile).
 */
export const resolveAssetSrc = (
  asset: Pick<Asset, 'src' | 'storage'>,
  location: FilesLocation,
): string => {
  if (ABSOLUTE_URL.test(asset.src)) {
    return asset.src;
  }
  if (asset.storage === 'project') {
    const path = asset.src.split('/').map(encodeURIComponent).join('/');
    return `${location.filesBaseUrl}/files/${encodeURIComponent(location.projectId)}/${path}`;
  }
  return staticFile(asset.src);
};
