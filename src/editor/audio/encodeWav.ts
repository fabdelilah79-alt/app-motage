/**
 * Encode des échantillons (−1 à 1) en fichier WAV mono 16 bits.
 * Le WAV est lu partout (aperçu et rendu) et garde une durée exacte, contrairement
 * aux fichiers WebM produits directement par le micro du navigateur.
 */
export const encodeWav = (samples: Float32Array, sampleRate: number): ArrayBuffer => {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // taille du bloc « fmt »
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    const value = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(44 + index * bytesPerSample, value, true);
  });
  return buffer;
};

/** Mélange les canaux d'un enregistrement en un seul (mono). */
export const mixToMono = (channels: readonly Float32Array[]): Float32Array => {
  const [first] = channels;
  if (!first) return new Float32Array(0);
  if (channels.length === 1) return first;
  const mono = new Float32Array(first.length);
  for (const channel of channels) {
    for (let i = 0; i < mono.length; i++) {
      mono[i] = (mono[i] ?? 0) + (channel[i] ?? 0) / channels.length;
    }
  }
  return mono;
};
