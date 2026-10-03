import type { Project, Scene } from './schema';

/**
 * Durée effective (en frames) de la transition qui mène à `scene` depuis `previous`.
 * Une transition doit rester strictement plus courte que chacune des deux scènes.
 */
export const getTransitionDuration = (previous: Scene, scene: Scene): number => {
  const transition = scene.transitionIn;
  if (!transition || transition.type === 'none') {
    return 0;
  }
  const maxDuration = Math.min(previous.durationInFrames, scene.durationInFrames) - 1;
  return Math.max(0, Math.min(transition.durationInFrames, maxDuration));
};

/** Durée totale de la vidéo : somme des scènes moins les chevauchements des transitions. */
export const computeProjectDuration = (project: Project): number =>
  project.scenes.reduce((total, scene, index) => {
    const previous = index > 0 ? project.scenes[index - 1] : undefined;
    const overlap = previous ? getTransitionDuration(previous, scene) : 0;
    return total + scene.durationInFrames - overlap;
  }, 0);
