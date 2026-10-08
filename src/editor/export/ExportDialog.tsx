import { FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportOptionsSchema, type ExportOptions } from '../../shared/exportOptions';
import { isRenderFinished } from '../../shared/render';
import type { Project } from '../../shared/schema';
import { projectSrt } from '../../shared/subtitles';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { ExportProgress } from './ExportProgress';
import { ExportSettingsForm } from './ExportSettingsForm';
import type { useRenderJob } from './useRenderJob';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  render: ReturnType<typeof useRenderJob>;
};

/** Télécharge un fichier texte créé dans le navigateur (sous-titres .srt). */
const downloadText = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/x-subrip;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

/** Fenêtre d'export : réglages (format, qualité, taille, partie), puis progression. */
export const ExportDialog = ({ open, onOpenChange, project, render }: Props) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ExportOptions>(() => exportOptionsSchema.parse({}));
  const [started, setStarted] = useState(false);
  const { job, failed } = render;
  const running = started && !failed && (!job || !isRenderFinished(job.status));
  const status = failed ? 'error' : (job?.status ?? 'bundling');
  const hasSubtitles = project.scenes.some((scene) => scene.subtitles.length > 0);

  const close = (next: boolean) => {
    if (!next) setStarted(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close} title={t('export.title')} locked={running} wide>
      {started ? (
        <div className="flex flex-col gap-4" data-testid="export-status" data-status={status}>
          <ExportProgress job={job} failed={failed} />
          <div className="flex justify-end gap-2">
            {running ? (
              <Button variant="danger" onClick={() => void render.cancel()} disabled={!job}>
                {t('export.cancel')}
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setStarted(false)}>
                  {t('exportSettings.again')}
                </Button>
                <Button onClick={() => close(false)}>{t('common.close')}</Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ExportSettingsForm project={project} options={options} onChange={setOptions} />
          <div className="flex flex-wrap justify-between gap-2">
            <Button variant="ghost" disabled={!hasSubtitles} onClick={() => downloadText(`${project.id}.srt`, projectSrt(project))}>
              <FileText size={14} aria-hidden />
              {t('exportSettings.downloadSrt')}
            </Button>
            <Button
              variant="primary"
              data-testid="export-start"
              onClick={() => {
                setStarted(true);
                void render.start(project, options);
              }}
            >
              {t('exportSettings.start')}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
