/** Hauteurs (0 à 1) de la forme d'onde : maximum absolu par tranche d'échantillons. */
export const computePeaks = (samples: Float32Array, buckets: number): number[] => {
  if (samples.length === 0 || buckets <= 0) return [];
  const size = samples.length / buckets;
  const peaks: number[] = [];
  let loudest = 0;
  for (let bucket = 0; bucket < buckets; bucket++) {
    let max = 0;
    const end = Math.min(samples.length, Math.floor((bucket + 1) * size));
    for (let i = Math.floor(bucket * size); i < end; i++) {
      max = Math.max(max, Math.abs(samples[i] ?? 0));
    }
    peaks.push(max);
    loudest = Math.max(loudest, max);
  }
  // Normalisation : une voix faible reste visible.
  return loudest > 0 ? peaks.map((peak) => peak / loudest) : peaks;
};
