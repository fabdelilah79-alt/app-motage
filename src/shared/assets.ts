import type { Project } from './schema';

/** Identifiants des médias réellement utilisés (éléments, voix off, musiques). */
export const usedAssetIds = (project: Project): Set<string> => {
  const used = new Set<string>();
  for (const scene of project.scenes) {
    if (scene.voiceover) used.add(scene.voiceover.assetId);
    for (const element of scene.elements) {
      if ('assetId' in element) used.add(element.assetId);
    }
  }
  for (const track of project.audioTracks) used.add(track.assetId);
  return used;
};
