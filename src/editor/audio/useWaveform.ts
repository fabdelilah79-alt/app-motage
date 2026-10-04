import { getAudioData } from '@remotion/media-utils';
import { useEffect, useState } from 'react';
import { computePeaks } from './peaks';

const cache = new Map<string, number[]>();

/** Forme d'onde d'un son (pour la timeline), calculée une fois par fichier. */
export const useWaveform = (src: string | null, buckets = 400): number[] | null => {
  const key = src ? `${src}#${buckets}` : null;
  const [peaks, setPeaks] = useState<number[] | null>(() =>
    key ? (cache.get(key) ?? null) : null,
  );

  useEffect(() => {
    if (!src || !key) return;
    const cached = cache.get(key);
    if (cached) {
      setPeaks(cached);
      return;
    }
    let active = true;
    getAudioData(src)
      .then((data) => {
        const channel = data.channelWaveforms[0] ?? new Float32Array(0);
        const result = computePeaks(channel, buckets);
        cache.set(key, result);
        if (active) setPeaks(result);
      })
      .catch(() => active && setPeaks(null));
    return () => {
      active = false;
    };
  }, [src, key, buckets]);

  return peaks;
};
