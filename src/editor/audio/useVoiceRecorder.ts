import { useCallback, useEffect, useRef, useState } from 'react';
import { encodeWav, mixToMono } from './encodeWav';

export type RecorderState = 'idle' | 'recording' | 'processing' | 'denied' | 'error';

export type Recording = { wav: Blob; durationInSeconds: number };

/**
 * Enregistrement au micro (MediaRecorder), puis conversion en WAV mono pour un rendu fiable.
 * Le navigateur demande l'autorisation d'utiliser le micro la première fois.
 */
export const useVoiceRecorder = (onRecorded: (recording: Recording) => void) => {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<number | null>(null);
  const onRecordedRef = useRef(onRecorded);
  onRecordedRef.current = onRecorded;

  const stopTimer = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const start = useCallback(async () => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState('denied');
      return;
    }
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());
      setState('processing');
      try {
        const context = new AudioContext();
        const decoded = await context.decodeAudioData(await new Blob(chunks).arrayBuffer());
        const channels = Array.from({ length: decoded.numberOfChannels }, (_, i) =>
          decoded.getChannelData(i),
        );
        const wav = new Blob([encodeWav(mixToMono(channels), decoded.sampleRate)], {
          type: 'audio/wav',
        });
        await context.close();
        onRecordedRef.current({ wav, durationInSeconds: decoded.duration });
        setState('idle');
      } catch {
        setState('error');
      }
    };
    recorder.current = mediaRecorder;
    mediaRecorder.start();
    setElapsed(0);
    setState('recording');
    const startedAt = performance.now();
    const tick = () => setElapsed((performance.now() - startedAt) / 1000);
    timer.current = window.setInterval(tick, 200);
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    if (recorder.current?.state === 'recording') recorder.current.stop();
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { state, elapsed, start, stop };
};
