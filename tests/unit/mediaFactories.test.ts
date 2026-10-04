import { describe, expect, it } from 'vitest';
import { usedAssetIds } from '../../src/shared/assets';
import {
  createIconElement,
  createMediaElement,
  createShapeElement,
} from '../../src/shared/mediaFactories';
import { assetSchema, parseProject, sceneElementSchema } from '../../src/shared/schema';
import { makeProjectInput } from './fixtures';

const format = { width: 1920, height: 1080, fps: 30 } as const;
const asset = (kind: string, meta = {}) =>
  assetSchema.parse({ id: `a-${kind}`, kind, src: `assets/x.${kind}`, storage: 'project', meta });

describe('éléments créés à partir des médias', () => {
  it('crée un élément valide pour chaque média visuel', () => {
    for (const kind of ['image', 'gif', 'video', 'lottie']) {
      const element = createMediaElement(format, 150, asset(kind, { width: 1600, height: 900 }));
      expect(element?.type).toBe(kind);
      expect(sceneElementSchema.parse(element)).toEqual(element);
      // Proportions du média respectées (16:9).
      expect(element?.transform.width).toBe(960);
      expect(element?.transform.height).toBe(540);
    }
  });

  it('limite une vidéo à sa propre durée et ignore les sons', () => {
    const video = createMediaElement(format, 300, asset('video', { durationInSeconds: 4 }));
    expect(video?.timing.duration).toBe(120);
    expect(createMediaElement(format, 300, asset('audio'))).toBeUndefined();
  });

  it('crée des icônes et des formes valides', () => {
    expect(() => sceneElementSchema.parse(createIconElement(format, 90, 'atom'))).not.toThrow();
    for (const shape of ['rectangle', 'arrow', 'bubble'] as const) {
      expect(() => sceneElementSchema.parse(createShapeElement(format, 90, shape))).not.toThrow();
    }
  });

  it('repère les médias utilisés (éléments, voix off, musique)', () => {
    const project = parseProject(
      makeProjectInput({
        assets: [
          { id: 'img', kind: 'image', src: 'a.png' },
          { id: 'voix', kind: 'audio', src: 'v.wav' },
          { id: 'musique', kind: 'audio', src: 'm.wav' },
          { id: 'orphelin', kind: 'audio', src: 'o.wav' },
        ],
        audioTracks: [{ id: 't', assetId: 'musique' }],
        scenes: [{ id: 's', durationInFrames: 60, voiceover: { assetId: 'voix' } }],
      }),
    );
    expect([...usedAssetIds(project)].sort()).toEqual(['musique', 'voix']);
  });
});
