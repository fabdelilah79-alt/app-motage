import { CheckCircle2, CircleAlert, Download, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { estimateRemainingSeconds, isRenderFinished, type RenderJobState } from '../../shared/render';
import { api, renderFileUrl } from '../api/client';
import { Button } from '../ui/button';

type Props = { job: RenderJobState | null; failed: boolean };

/** Progression de l'export : pourcentage, temps restant estimé, puis fichier prêt. */
export const ExportProgress = ({ job, failed }: Props) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => Date.now());
  const running = !failed && (!job || !isRenderFinished(job.status));
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const percent = Math.round((job?.progress ?? 0) * 100);
  const status = failed ? 'error' : (job?.status ?? 'bundling');
  const remaining = job ? estimateRemainingSeconds(job.progress, job.startedAt, now) : null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">{t(`export.status.${status}`, { percent })}</p>
      {running ? (
        <>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-sky-500" style={{ width: `${percent}%` }} />
          </div>
          {remaining !== null ? (
            <p className="text-xs text-slate-400" data-testid="export-remaining">
              {t('exportSettings.remaining', { minutes: Math.floor(remaining / 60), seconds: String(remaining % 60).padStart(2, '0') })}
            </p>
          ) : null}
        </>
      ) : null}
      {job?.status === 'done' ? (
        <div className="flex flex-col gap-2 rounded-md bg-emerald-950 p-3 text-sm text-emerald-200">
          <span className="flex items-start gap-2">
            <CheckCircle2 size={18} className="shrink-0" aria-hidden />
            <span>
              {t('export.savedTo')} <code className="break-all" dir="ltr">{job.outputPath}</code>
            </span>
          </span>
          <span className="flex flex-wrap gap-2">
            <a href={renderFileUrl(job.id)} download className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-3 py-1.5 text-xs hover:bg-emerald-700" data-testid="export-download">
              <Download size={14} aria-hidden />
              {t('exportSettings.download')}
            </a>
            <Button size="sm" variant="ghost" onClick={() => void api.openExportsFolder().catch(() => undefined)}>
              <FolderOpen size={14} aria-hidden />
              {t('exportSettings.openFolder')}
            </Button>
          </span>
        </div>
      ) : null}
      {job?.status === 'error' || failed ? (
        <div className="flex items-start gap-2 rounded-md bg-rose-950 p-3 text-sm text-rose-200">
          <CircleAlert size={18} className="shrink-0" aria-hidden />
          <span>{t('export.failedHelp')}</span>
        </div>
      ) : null}
    </div>
  );
};
