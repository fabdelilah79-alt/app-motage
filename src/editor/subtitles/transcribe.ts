import type { Caption } from '@remotion/captions';
import type { Lang } from '../../shared/schema';

/** Le navigateur ne permet pas la transcription locale (WebGPU absent ou page non sécurisée). */
export class TranscriptionUnsupportedError extends Error {
  constructor(detail: string) {
    super(detail);
    this.name = 'TranscriptionUnsupportedError';
  }
}

export type TranscriptionStage = 'download' | 'decode' | 'transcribe';

/** Modèle multilingue léger (≈ 80 Mo, téléchargé une seule fois puis gardé en cache). */
const MODEL = 'base';

/**
 * Transcription locale (Whisper sur la carte graphique, dans le navigateur) d'un son du
 * projet : rien n'est envoyé sur Internet, seul le modèle est téléchargé la première fois.
 */
export const transcribeAudio = async (
  url: string,
  lang: Lang,
  onStage: (stage: TranscriptionStage, progress: number) => void,
): Promise<Caption[]> => {
  // Chargé à la demande : ce gros module n'alourdit pas le démarrage de l'éditeur.
  const whisper = await import('@remotion/whisper-webgpu');
  const support = await whisper.canUseWhisperWebGpu();
  if (!support.supported) throw new TranscriptionUnsupportedError(support.detailedReason);
  onStage('download', 0);
  await whisper.downloadWhisperModel({
    model: MODEL,
    onProgress: (progress) => onStage('download', progress.progress),
  });
  onStage('decode', 0);
  const audio = await (await fetch(url)).blob();
  const channelWaveform = await whisper.resampleTo16Khz({
    file: audio,
    onProgress: (progress) => onStage('decode', progress),
  });
  onStage('transcribe', 0);
  const transcription = await whisper.transcribe({ channelWaveform, model: MODEL, language: lang });
  onStage('transcribe', 1);
  return whisper.toCaptions({ whisperWebGpuOutput: transcription }).captions;
};
