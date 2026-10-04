import type { AudioTrack, Project } from './schema';
import { sceneStartFrames } from './timeline';

/** Intervalle de frames [start, end) dans toute la vidéo. */
export type FrameInterval = { start: number; end: number };

/** Durée (en frames) de la montée / descente de la musique autour d'une voix off. */
export const DUCKING_RAMP_FRAMES = 12;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Moments où une voix off est entendue, dans toute la vidéo. Sans durée connue,
 * la voix est supposée durer jusqu'à la fin de sa scène.
 */
export const voiceIntervals = (project: Project): FrameInterval[] => {
  const starts = sceneStartFrames(project);
  const { fps } = project.format;
  return project.scenes.flatMap((scene, index) => {
    const voice = scene.voiceover;
    if (!voice) return [];
    const asset = project.assets.find((item) => item.id === voice.assetId);
    const sceneStart = starts[index] ?? 0;
    const start = sceneStart + voice.offset;
    const seconds = asset?.meta.durationInSeconds;
    const sceneEnd = sceneStart + scene.durationInFrames;
    const end = seconds ? Math.min(sceneEnd, start + Math.ceil(seconds * fps)) : sceneEnd;
    return end > start ? [{ start, end }] : [];
  });
};

/** Atténuation (1 = aucune) : `level` pendant les voix, avec une rampe douce avant et après. */
export const duckingFactor = (
  frame: number,
  intervals: readonly FrameInterval[],
  level: number,
  ramp = DUCKING_RAMP_FRAMES,
): number =>
  intervals.reduce((factor, { start, end }) => {
    // Distance (en frames) à la voix la plus proche : 0 pendant la voix.
    const distance = frame < start ? start - frame : frame >= end ? frame - end : 0;
    let local = level + (1 - level) * (distance / Math.max(1, ramp));
    if (distance === 0) local = level;
    else if (distance >= ramp) local = 1;
    return Math.min(factor, local);
  }, 1);

/** Fondu d'entrée et de sortie (1 = plein volume). */
export const fadeFactor = (frame: number, total: number, fadeIn: number, fadeOut: number) => {
  const fadeInFactor = fadeIn > 0 ? clamp01(frame / fadeIn) : 1;
  const fadeOutFactor = fadeOut > 0 ? clamp01((total - frame) / fadeOut) : 1;
  return Math.min(fadeInFactor, fadeOutFactor);
};

/** Volume de la musique à une frame : volume × fondus × atténuation sous les voix. */
export const musicVolumeAt = (
  frame: number,
  track: AudioTrack,
  totalFrames: number,
  intervals: readonly FrameInterval[],
): number => {
  const ducking = track.ducking.enabled ? duckingFactor(frame, intervals, track.ducking.level) : 1;
  return track.volume * fadeFactor(frame, totalFrames, track.fadeIn, track.fadeOut) * ducking;
};

/** Durée conseillée d'une scène pour contenir toute sa voix off (+ 0,5 s de respiration). */
export const sceneDurationForVoice = (offset: number, voiceSeconds: number, fps: number) =>
  offset + Math.ceil((voiceSeconds + 0.5) * fps);
