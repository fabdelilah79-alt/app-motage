import { Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TextElement } from '../../../shared/schema';
import { suggestTextDuration } from '../../../shared/textContent';
import { formatSeconds } from '../../../shared/time';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';

/** Durée de lecture conseillée (≈ 3 mots par seconde, au moins 2 s). */
export const SuggestedDuration = ({ element, fps }: { element: TextElement; fps: number }) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const suggested = suggestTextDuration(element.content, fps, element.lang);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-slate-800/60 p-2 text-xs">
      <span className="flex items-center gap-1.5 text-slate-300">
        <Clock size={14} aria-hidden />
        {t('text.suggestedDuration', { duration: formatSeconds(suggested, fps, i18n.language) })}
      </span>
      <Button
        size="sm"
        disabled={element.timing.duration === suggested}
        onClick={() =>
          updateElement(element.id, (draft) => {
            draft.timing.duration = suggested;
          })
        }
      >
        {t('text.apply')}
      </Button>
    </div>
  );
};
