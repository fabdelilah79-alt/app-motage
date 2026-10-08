import { Clock, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../ui/cn';

/**
 * Bascule du canevas : « vue de placement » (tout visible, immobile) ou « vue à l'instant »
 * (la vidéo telle qu'elle est à la tête de lecture, animations comprises).
 */
export const LayoutViewToggle = ({ active }: { active: boolean }) => {
  const { t } = useTranslation();
  const layoutView = useEditorStore((state) => state.layoutView);
  const setLayoutView = useEditorStore((state) => state.setLayoutView);
  return (
    <button
      type="button"
      data-testid="layout-view-toggle"
      aria-pressed={layoutView}
      title={t(layoutView ? 'canvas.layoutViewHelp' : 'canvas.timeViewHelp')}
      onClick={() => setLayoutView(!layoutView)}
      className={cn(
        'absolute start-2 top-2 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-lg',
        active ? 'bg-sky-600 text-white' : 'bg-slate-800/90 text-slate-200 ring-1 ring-slate-600',
      )}
    >
      {layoutView ? <LayoutGrid size={14} aria-hidden /> : <Clock size={14} aria-hidden />}
      {t(layoutView ? 'canvas.layoutView' : 'canvas.timeView')}
    </button>
  );
};
