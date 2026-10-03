import { Check } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextElement } from '../../../shared/schema';
import { FONT_CATALOG, type FontCategory } from '../../../video/text/fontCatalog';
import { findFont } from '../../../video/text/fontStack';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { cn } from '../../ui/cn';
import { Dialog } from '../../ui/dialog';

const CATEGORIES: readonly FontCategory[] = ['modern', 'classic', 'display', 'handwritten', 'mono'];
const SAMPLES = { arabic: 'السقوط الحر ١٢٣', latin: 'La chute libre 123' } as const;

/** Choix de la police, avec un aperçu dans l'écriture du texte (arabe ou latine). */
export const FontPicker = ({ element }: { element: TextElement }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const [open, setOpen] = useState(false);
  const script = element.lang === 'ar' ? 'arabic' : 'latin';
  const current = findFont(element.style.fontId);
  const fonts = FONT_CATALOG.filter((font) => font.script === script);

  const choose = (fontId: string | undefined) => {
    updateElement(element.id, (draft) => {
      if (draft.type === 'text') draft.style.fontId = fontId;
    });
    setOpen(false);
  };

  const option = (fontId: string | undefined, label: string, family: string | undefined) => {
    const active = element.style.fontId === fontId;
    return (
      <button
        key={fontId ?? 'default'}
        type="button"
        onClick={() => choose(fontId)}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-md border p-2 text-start',
          active ? 'border-sky-400' : 'border-slate-700 hover:border-slate-500',
        )}
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-[11px] text-slate-400">{label}</span>
          <span
            lang={element.lang}
            className="truncate text-xl"
            style={family ? { fontFamily: `"${family}"` } : undefined}
          >
            {SAMPLES[script]}
          </span>
        </span>
        {active ? <Check size={16} className="text-sky-300" aria-hidden /> : null}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-1 text-xs text-slate-400">
      <span>{t('text.font')}</span>
      <Button className="justify-start" onClick={() => setOpen(true)} data-testid="font-picker">
        <span style={current ? { fontFamily: `"${current.family}"` } : undefined}>
          {current?.family ?? t('text.defaultFont')}
        </span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title={t('text.chooseFont')}>
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pe-1">
          {option(undefined, t('text.defaultFont'), undefined)}
          {CATEGORIES.map((category) => {
            const inCategory = fonts.filter((font) => font.category === category);
            if (inCategory.length === 0) return null;
            return (
              <section key={category} className="flex flex-col gap-1.5">
                <h3 className="text-xs font-semibold text-slate-400">
                  {t(`fontCategories.${category}`)}
                </h3>
                {inCategory.map((font) => option(font.id, font.family, font.family))}
              </section>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
};
