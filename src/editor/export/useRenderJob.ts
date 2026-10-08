import { useCallback, useEffect, useRef, useState } from 'react';
import { isRenderFinished, renderJobStateSchema, type RenderJobState } from '../../shared/render';
import type { ExportOptions } from '../../shared/exportOptions';
import type { Project } from '../../shared/schema';
import { api, renderEventsUrl } from '../api/client';

/** Lance un export MP4 sur le serveur local et suit sa progression en direct (SSE). */
export const useRenderJob = () => {
  const [job, setJob] = useState<RenderJobState | null>(null);
  const [failed, setFailed] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const stopListening = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
  }, []);

  const start = useCallback(async (project: Project, options: ExportOptions) => {
    stopListening();
    setJob(null);
    setFailed(false);
    try {
      const started = await api.startRender(project, options);
      setJob(started);
      const source = new EventSource(renderEventsUrl(started.id));
      sourceRef.current = source;
      source.onmessage = (event: MessageEvent<string>) => {
        const parsed = renderJobStateSchema.safeParse(JSON.parse(event.data));
        if (!parsed.success) return;
        setJob(parsed.data);
        if (isRenderFinished(parsed.data.status)) stopListening();
      };
      source.onerror = () => stopListening();
    } catch {
      setFailed(true);
    }
  }, [stopListening]);

  const cancel = useCallback(async () => {
    if (job) await api.cancelRender(job.id).catch(() => undefined);
  }, [job]);

  useEffect(() => stopListening, [stopListening]);

  return { job, failed, start, cancel };
};
