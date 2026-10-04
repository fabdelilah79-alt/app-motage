import { describe, expect, it } from 'vitest';
import { computePeaks } from '../../src/editor/audio/peaks';
import { encodeWav, mixToMono } from '../../src/editor/audio/encodeWav';
import {
  cropInnerStyle,
  kenBurnsTransform,
  mediaFrameStyle,
} from '../../src/video/media/frameStyles';
import { shapePath } from '../../src/video/media/shapePaths';
import { shapeKindSchema } from '../../src/shared/schema';

describe('enregistrement de la voix : WAV mono 16 bits', () => {
  it('écrit un en-tête WAV correct et les échantillons', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 0.5]), 48000);
    const view = new DataView(wav);
    const text = (offset: number) =>
      String.fromCharCode(...new Uint8Array(wav.slice(offset, offset + 4)));
    expect(wav.byteLength).toBe(44 + 8);
    expect([text(0), text(8), text(12), text(36)]).toEqual(['RIFF', 'WAVE', 'fmt ', 'data']);
    expect(view.getUint32(24, true)).toBe(48000);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32768);
  });

  it('mélange plusieurs canaux en un seul', () => {
    const mono = mixToMono([new Float32Array([1, 0]), new Float32Array([0, 1])]);
    expect(Array.from(mono)).toEqual([0.5, 0.5]);
  });

  it('calcule une forme d’onde normalisée', () => {
    expect(computePeaks(new Float32Array([0.1, -0.2, 0.05, 0.4]), 2)).toEqual([0.5, 1]);
    expect(computePeaks(new Float32Array(0), 4)).toEqual([]);
  });
});

describe('cadre des médias', () => {
  it('masque en cercle ou coins arrondis', () => {
    const frame = { cornerRadius: 10, shadow: false };
    expect(mediaFrameStyle({ ...frame, mask: 'circle' }).borderRadius).toBe('50%');
    expect(mediaFrameStyle({ ...frame, mask: 'rounded' }).borderRadius).toBe(10);
  });

  it('recadre en agrandissant puis décalant le média', () => {
    expect(cropInnerStyle({ top: 0, right: 25, bottom: 50, left: 25 })).toMatchObject({
      width: '200%',
      height: '200%',
      left: '-50%',
      top: '0%',
    });
  });

  it('Ken Burns : rien à 1, zoom progressif sinon', () => {
    expect(kenBurnsTransform({ zoom: 1, panX: 0, panY: 0 }, 0.5)).toBeUndefined();
    expect(kenBurnsTransform({ zoom: 1.2, panX: 0, panY: 0 }, 1)).toBe(
      'scale(1.2000) translate(0.000%, 0.000%)',
    );
  });
});

describe('formes', () => {
  it('donne un tracé pour chaque forme, toujours identique', () => {
    for (const shape of shapeKindSchema.options) {
      const first = shapePath(shape, 200, 100, 6, 2);
      expect(first.d.startsWith('M')).toBe(true);
      expect(shapePath(shape, 200, 100, 6, 2)).toEqual(first);
    }
  });

  it('un polygone a autant de sommets que de côtés', () => {
    const { d } = shapePath('polygon', 100, 100, 6);
    expect(d.split(/[ML]/).filter((part) => part.trim()).length).toBe(6);
  });
});
