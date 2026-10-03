/** Le temps est stocké en frames et affiché en secondes. */
export const framesToSeconds = (frames: number, fps: number): number => frames / fps;

export const secondsToFrames = (seconds: number, fps: number): number => Math.round(seconds * fps);

/** Ex. 45 frames à 30 i/s → « 1,5 s » en français, « 1.5 s » en anglais. */
export const formatSeconds = (frames: number, fps: number, locale: string): string => {
  const seconds = framesToSeconds(frames, fps);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(seconds);
  return `${formatted} s`;
};
