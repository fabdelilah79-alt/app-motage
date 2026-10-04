import { describe, expect, it } from 'vitest';
import { MEDIA_TYPES, parseRange } from '../../server/projects/fileNames';

describe('demandes partielles de fichiers (Range)', () => {
  it('lit les plages demandées', () => {
    expect(parseRange('bytes=0-99', 1000)).toEqual({ start: 0, end: 99 });
    expect(parseRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 });
    expect(parseRange('bytes=-100', 1000)).toEqual({ start: 900, end: 999 });
    expect(parseRange('bytes=900-5000', 1000)).toEqual({ start: 900, end: 999 });
  });

  it('refuse les plages invalides ou absentes', () => {
    expect(parseRange(undefined, 1000)).toBeNull();
    expect(parseRange('bytes=2000-3000', 1000)).toBeNull();
    expect(parseRange('bytes=-', 1000)).toBeNull();
    expect(parseRange('items=0-1', 1000)).toBeNull();
  });

  it('associe chaque type de fichier à un type de média', () => {
    expect(MEDIA_TYPES['video/mp4']?.kind).toBe('video');
    expect(MEDIA_TYPES['audio/mpeg']?.kind).toBe('audio');
    expect(MEDIA_TYPES['image/gif']?.kind).toBe('gif');
    expect(MEDIA_TYPES['application/x-lottie+json']?.kind).toBe('lottie');
    expect(MEDIA_TYPES['application/x-msdownload']).toBeUndefined();
  });
});
