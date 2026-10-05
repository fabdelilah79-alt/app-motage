import type { Project } from './schema';

/** Identifiants des médias réellement utilisés (éléments, fonds, voix off, musiques, logo). */
export const usedAssetIds = (project: Project): Set<string> => {
  const used = new Set<string>();
  for (const scene of project.scenes) {
    if (scene.voiceover) used.add(scene.voiceover.assetId);
    if ('assetId' in scene.background) used.add(scene.background.assetId);
    for (const element of scene.elements) {
      if ('assetId' in element) used.add(element.assetId);
    }
  }
  for (const track of project.audioTracks) used.add(track.assetId);
  if (project.brand?.logoAssetId) used.add(project.brand.logoAssetId);
  return used;
};
