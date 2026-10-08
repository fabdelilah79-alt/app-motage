import type { Caption } from '@remotion/captions';
import { describe, expect, it } from 'vitest';
import { parseProject } from '../../src/shared/schema';
import { activeCue, captionsToCues, cuesFromScript, projectCues, projectSrt, splitSentences } from '../../src/shared/subtitles';
import { makeProjectInput } from './fixtures';

let counter = 0;
const newId = () => String(++counter);
const word = (text: string, start: number, end: number): Caption => ({ text, startMs: start, endMs: end, timestampMs: null, confidence: null });

describe('sous-titres', () => {
  it('découpe le script en phrases (français et arabe)', () => {
    expect(splitSentences('Bonjour. Ça va ? Oui !')).toEqual(['Bonjour.', 'Ça va ?', 'Oui !']);
    expect(splitSentences('ما هي السرعة؟ إنها المسافة على الزمن.')).toEqual(['ما هي السرعة؟', 'إنها المسافة على الزمن.']);
    expect(splitSentences('ligne 1\nligne 2')).toEqual(['ligne 1', 'ligne 2']);
  });

  it('répartit les phrases du script sur la durée de la scène', () => {
    const cues = cuesFromScript('Une phrase. Une autre phrase plus longue.', 150, newId);
    expect(cues).toHaveLength(2);
    expect(cues[0]?.from).toBe(0);
    expect(cues[0]?.to).toBe(cues[1]?.from);
    expect(cues[1]?.to).toBe(150);
    expect((cues[0]?.to ?? 0) < 75).toBe(true);
    expect(cuesFromScript('', 150, newId)).toEqual([]);
  });

  it('regroupe les mots transcrits en sous-titres lisibles', () => {
    const captions = [word(' La', 0, 200), word(' vitesse', 200, 600), word(' augmente.', 600, 1000), word(' Puis', 1200, 1400), word(' elle', 1400, 1600)];
    const cues = captionsToCues(captions, 30, 0, 42, 4, newId);
    expect(cues.map((cue) => cue.text)).toEqual(['La vitesse augmente.', 'Puis elle']);
    expect(cues[0]).toMatchObject({ from: 0, to: 30 });
    // Voix décalée de 15 frames dans la scène.
    expect(captionsToCues(captions, 30, -15, 42, 4, newId)[0]).toMatchObject({ from: 15, to: 45 });
    const long = Array.from({ length: 12 }, (_, i) => word(' mot', i * 300, i * 300 + 250));
    expect(captionsToCues(long, 30, 0, 20, 10, newId).every((cue) => cue.text.length <= 20)).toBe(true);
  });

  it('place les sous-titres dans la vidéo complète et écrit un .srt', () => {
    const project = parseProject(
      makeProjectInput({
        scenes: [
          { id: 'a', durationInFrames: 60, subtitles: [{ id: 's1', from: 0, to: 30, text: 'Bonjour' }] },
          { id: 'b', durationInFrames: 60, transitionIn: { type: 'fade', durationInFrames: 15 }, subtitles: [{ id: 's2', from: 0, to: 60, text: 'مرحبا' }] },
        ],
      }),
    );
    expect(projectCues(project)).toEqual([
      { text: 'Bonjour', startFrame: 0, endFrame: 30 },
      { text: 'مرحبا', startFrame: 45, endFrame: 105 },
    ]);
    const srt = projectSrt(project);
    expect(srt).toContain('00:00:00,000 --> 00:00:01,000');
    expect(srt).toContain('00:00:01,500 --> 00:00:03,500');
    expect(srt).toContain('مرحبا');
    expect(activeCue(project.scenes[0]?.subtitles ?? [], 29)?.text).toBe('Bonjour');
    expect(activeCue(project.scenes[0]?.subtitles ?? [], 30)).toBeUndefined();
  });
});
