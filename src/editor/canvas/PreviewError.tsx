import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Message clair (au lieu d'une erreur technique) quand l'aperçu ne peut pas s'afficher. */
export const PreviewError = ({ error }: { error: Error }) => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-900 p-6 text-center text-slate-200">
      <TriangleAlert size={32} className="text-amber-400" aria-hidden />
      <p className="text-sm font-semibold">{t('errors.preview')}</p>
      <p className="text-xs text-slate-400">{t('errors.previewHelp')}</p>
      <details className="max-w-full text-start text-[10px] text-slate-500">
        <summary>{t('errors.details')}</summary>
        <code className="break-all" dir="ltr">
          {error.message}
        </code>
      </details>
    </div>
  );
};
