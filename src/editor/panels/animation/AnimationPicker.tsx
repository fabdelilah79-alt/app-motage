import { Ban, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ElementType } from '../../../shared/schema';
import { PRESET_LIST } from '../../../video/animations/registry';
import type { AnimationCategory } from '../../../video/animations/types';
import type { UiLang } from '../../i18n';
import { Button } from '../../ui/button';
import { cn } from '../../ui/cn';
import { Dialog } from '../../ui/dialog';
import { PresetTile } from './PresetTile';

type Props = {
  categories: readonly AnimationCategory[];
  elementType: ElementType;
  value: string | undefined;
  onChange: (presetId: string | undefined) => void;
  /** Proposer « Aucune » (apparition, disparition). */
  allowNone?: boolean;
  label: string;
  testId: string;
  /** Texte du bouton quand aucune animation n'est choisie. */
  emptyText?: string;
};

/** Menu d'animations en vignettes, avec aperçu animé au survol de chaque option. */
export const AnimationPicker = (props: Props) => {
  const { categories, elementType, value, onChange, allowNone = false, label, testId } = props;
  const emptyText = props.emptyText;
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = PRESET_LIST.find((preset) => preset.id === value);
  const choose = (presetId: string | undefined) => {
    onChange(presetId);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 text-xs text-slate-400">
      <span>{label}</span>
      <Button className="justify-start" onClick={() => setOpen(true)} data-testid={testId}>
        <Sparkles size={14} aria-hidden />
        {current
          ? (current.name[i18n.language as UiLang] ?? current.name.fr)
          : (emptyText ?? t('animation.none'))}
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title={label} wide>
        <p className="mb-2 text-xs text-slate-400">{t('animation.hoverHelp')}</p>
        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pe-1">
          {allowNone ? (
            <button
              type="button"
              onClick={() => choose(undefined)}
              className={cn(
                'flex items-center gap-2 rounded-md border p-2 text-sm',
                value === undefined ? 'border-sky-400' : 'border-slate-700 hover:border-slate-500',
              )}
            >
              <Ban size={16} aria-hidden />
              {t('animation.none')}
            </button>
          ) : null}
          {categories.map((category) => {
            const presets = PRESET_LIST.filter(
              (preset) =>
                preset.category === category &&
                (preset.compatibleElements === 'all' ||
                  preset.compatibleElements.includes(elementType)),
            );
            return (
              <section key={category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-slate-300">
                  {t(`animation.categories.${category}`)}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <PresetTile
                      key={preset.id}
                      preset={preset}
                      selected={preset.id === value}
                      onSelect={() => choose(preset.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </Dialog>
    </div>
  );
};
