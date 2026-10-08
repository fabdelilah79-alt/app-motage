import type { Caption } from '@remotion/captions';
import { serializeSrt } from '@remotion/captions';
import { randomId, type IdGenerator } from './factories';
import type { Project, SubtitleCue } from './schema';
import { sceneStartFrames } from './timeline';

/** Sous-titre visible à une frame de la scène (le premier qui commence avant). */
export const activeCue = (cues: readonly SubtitleCue[], frame: number) =>
  cues.find((cue) => frame >= cue.from && frame < cue.to);

/** Découpe un texte en phrases (., !, ?, ؟, retours à la ligne). */
export const splitSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?؟…])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence !== '');

/**
 * Sous-titres tirés du script de la voix off : une phrase par sous-titre, durée
 * proportionnelle à sa longueur, répartis sur `durationInFrames`.
 */
export const cuesFromScript = (
  script: string,
  durationInFrames: number,
  newId: IdGenerator = randomId,
): SubtitleCue[] => {
  const sentences = splitSentences(script);
  const total = sentences.reduce((sum, sentence) => sum + sentence.length, 0);
  if (total === 0 || durationInFrames <= 0) return [];
  let cursor = 0;
  return sentences.map((text, index) => {
    const from = cursor;
    const to =
      index === sentences.length - 1
        ? durationInFrames
        : Math.max(from + 1, Math.round(cursor + (durationInFrames * text.length) / total));
    cursor = to;
    return { id: `sub-${newId()}`, from, to, text };
  });
};

/**
 * Regroupe les mots transcrits (Whisper) en sous-titres lisibles : au plus `maxChars`
 * caractères et `maxSeconds` secondes, coupure après une ponctuation forte.
 */
export const captionsToCues = (
  captions: readonly Caption[],
  fps: number,
  offsetFrames = 0,
  maxChars = 42,
  maxSeconds = 4,
  newId: IdGenerator = randomId,
): SubtitleCue[] => {
  const cues: SubtitleCue[] = [];
  let words: Caption[] = [];
  const flush = () => {
    const first = words[0];
    const last = words[words.length - 1];
    if (!first || !last) return;
    const text = words.map((word) => word.text).join('').replace(/\s+/g, ' ').trim();
    if (text) {
      cues.push({
        id: `sub-${newId()}`,
        from: Math.max(0, Math.round((first.startMs / 1000) * fps) - offsetFrames),
        to: Math.max(1, Math.round((last.endMs / 1000) * fps) - offsetFrames),
        text,
      });
    }
    words = [];
  };
  for (const caption of captions) {
    const candidate = [...words, caption];
    const length = candidate.map((word) => word.text).join('').trim().length;
    const first = candidate[0];
    const tooLong = length > maxChars || (first !== undefined && caption.endMs - first.startMs > maxSeconds * 1000);
    if (tooLong && words.length > 0) flush();
    words.push(caption);
    if (/[.!?؟]$/.test(caption.text.trim())) flush();
  }
  flush();
  return cues;
};

/** Tous les sous-titres du projet, en frames de la vidéo complète. */
export const projectCues = (project: Project) => {
  const starts = sceneStartFrames(project);
  return project.scenes.flatMap((scene, index) =>
    scene.subtitles.map((cue) => ({
      text: cue.text,
      startFrame: (starts[index] ?? 0) + cue.from,
      endFrame: (starts[index] ?? 0) + Math.min(cue.to, scene.durationInFrames),
    })),
  );
};

/** Fichier de sous-titres .srt (horodatage en millisecondes). */
export const projectSrt = (project: Project): string => {
  const msPerFrame = 1000 / project.format.fps;
  const lines = projectCues(project)
    .filter((cue) => cue.text.trim() !== '' && cue.endFrame > cue.startFrame)
    .map((cue): Caption[] => [
      {
        text: cue.text,
        startMs: Math.round(cue.startFrame * msPerFrame),
        endMs: Math.round(cue.endFrame * msPerFrame),
        timestampMs: null,
        confidence: null,
      },
    ]);
  return serializeSrt({ lines });
};
