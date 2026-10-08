/**
 * Échantillons à pré-calculer et index courant : une valeur par frame de l'élément ;
 * le ralenti change le temps simulé entre deux frames, la pause fige l'index.
 */
export const simulationSampling = (
  durationInFrames: number,
  fps: number,
  playbackRate: number,
) => ({ interval: playbackRate / fps, count: Math.max(2, durationInFrames + 1) });

export const simulationIndex = (frame: number, count: number, freezeAt: number | undefined) =>
  Math.max(0, Math.min(count - 1, freezeAt === undefined ? frame : Math.min(frame, freezeAt)));
