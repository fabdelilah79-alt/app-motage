import { RotateCcw, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';

/** Écran affiché après une erreur inattendue : le travail est enregistré automatiquement. */
export const AppCrash = ({ error }: { error: Error }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center text-slate-100">
      <TriangleAlert size={40} className="text-amber-400" aria-hidden />
      <h1 className="text-lg font-semibold">{t('errors.crash')}</h1>
      <p className="max-w-md text-sm text-slate-300">{t('errors.crashHelp')}</p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        <RotateCcw size={16} aria-hidden />
        {t('errors.reload')}
      </Button>
      <details className="max-w-xl text-start text-xs text-slate-500">
        <summary>{t('errors.details')}</summary>
        <code className="break-all" dir="ltr">
          {error.message}
        </code>
      </details>
    </div>
  );
};
