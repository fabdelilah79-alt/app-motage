import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isRenderFinished, type RenderJobState } from '../../shared/render';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: RenderJobState | null;
  failed: boolean;
  onCancel: () => void;
};

/** Fenêtre d'export : progression, annulation, emplacement du fichier MP4. */
export const ExportDialog = ({ open, onOpenChange, job, failed, onCancel }: Props) => {
  const { t } = useTranslation();
  const running = !failed && (!job || !isRenderFinished(job.status));
  const percent = Math.round((job?.progress ?? 0) * 100);
  const status = failed ? 'error' : (job?.status ?? 'bundling');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('export.title')} locked={running}>
      <div className="flex flex-col gap-4" data-testid="export-status" data-status={status}>
        <p className="text-sm">{t(`export.status.${status}`, { percent })}</p>
        {running ? (
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-sky-500" style={{ width: `${percent}%` }} />
          </div>
        ) : null}
        {job?.status === 'done' ? (
          <div className="flex items-start gap-2 rounded-md bg-emerald-950 p-3 text-sm text-emerald-200">
            <CheckCircle2 size={18} className="shrink-0" aria-hidden />
            <span>
              {t('export.savedTo')} <code className="break-all" dir="ltr">{job.outputPath}</code>
            </span>
          </div>
        ) : null}
        {job?.status === 'error' || failed ? (
          <div className="flex items-start gap-2 rounded-md bg-rose-950 p-3 text-sm text-rose-200">
            <CircleAlert size={18} className="shrink-0" aria-hidden />
            <span>{t('export.failedHelp')}</span>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          {running ? (
            <Button variant="danger" onClick={onCancel} disabled={!job}>
              {t('export.cancel')}
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>{t('common.close')}</Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
