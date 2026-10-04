import { describe, expect, it } from 'vitest';
import {
  duckingFactor,
  fadeFactor,
  musicVolumeAt,
  sceneDurationForVoice,
  voiceIntervals,
} from '../../src/shared/audioMix';
import { audioTrackSchema, parseProject } from '../../src/shared/schema';
import { sceneStartFrames } from '../../src/shared/timeline';
import { makeProjectInput } from './fixtures';

const project = parseProject(
  makeProjectInput({
    assets: [
      {
        id: 'voix',
        kind: 'audio',
        src: 'assets/v.wav',
        storage: 'project',
        meta: { durationInSeconds: 2 },
      },
    ],
    scenes: [
      { id: 'a', durationInFrames: 120 },
      {
        id: 'b',
        durationInFrames: 150,
        transitionIn: { type: 'fade', durationInFrames: 20 },
        voiceover: { assetId: 'voix', offset: 15 },
      },
    ],
  }),
);

describe('mixage audio', () => {
  it('calcule le début de chaque scène (transitions comprises)', () => {
    expect(sceneStartFrames(project)).toEqual([0, 100]);
  });

  it('place la voix off dans toute la vidéo', () => {
    // Scène b : début 100, voix décalée de 15 frames, durée 2 s = 60 frames.
    expect(voiceIntervals(project)).toEqual([{ start: 115, end: 175 }]);
  });

  it('baisse la musique pendant la voix, avec une rampe douce', () => {
    const intervals = [{ start: 100, end: 200 }];
    expect(duckingFactor(50, intervals, 0.3, 10)).toBe(1);
    expect(duckingFactor(150, intervals, 0.3, 10)).toBe(0.3);
    expect(duckingFactor(95, intervals, 0.3, 10)).toBeCloseTo(0.65);
    expect(duckingFactor(205, intervals, 0.3, 10)).toBeCloseTo(0.65);
    expect(duckingFactor(215, intervals, 0.3, 10)).toBe(1);
  });

  it('applique les fondus d’entrée et de sortie', () => {
    expect(fadeFactor(0, 300, 30, 60)).toBe(0);
    expect(fadeFactor(15, 300, 30, 60)).toBe(0.5);
    expect(fadeFactor(150, 300, 30, 60)).toBe(1);
    expect(fadeFactor(270, 300, 30, 60)).toBe(0.5);
  });

  it('combine volume, fondus et atténuation pour la musique', () => {
    const input = { id: 'm', assetId: 'musique', volume: 0.5, fadeIn: 0, fadeOut: 0 };
    const track = audioTrackSchema.parse(input);
    const intervals = voiceIntervals(project);
    expect(musicVolumeAt(50, track, 250, intervals)).toBe(0.5);
    expect(musicVolumeAt(140, track, 250, intervals)).toBeCloseTo(0.5 * 0.35);
    const noDucking = { ...track, ducking: { enabled: false, level: 0.35 } };
    expect(musicVolumeAt(140, noDucking, 250, intervals)).toBe(0.5);
  });

  it('cale la durée de la scène sur la voix (+ 0,5 s)', () => {
    expect(sceneDurationForVoice(15, 2, 30)).toBe(15 + 75);
  });
});
