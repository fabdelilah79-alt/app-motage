import { Bold, Highlighter, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TextRunStyle } from '../../../shared/schema';
import { cn } from '../../ui/cn';
import { ColorInput } from '../ColorInput';

type Props = { style: TextRunStyle; onChange: (style: TextRunStyle) => void; mathOnly?: boolean };

const toggleClass = (active: boolean) =>
  cn(
    'flex h-8 items-center gap-1 rounded-md border px-2 text-xs',
    active ? 'border-sky-400 bg-sky-950 text-sky-200' : 'border-slate-700 text-slate-300',
  );

/** Style d'un segment : couleur propre, gras, surlignage. */
export const RunStyleBar = ({ style, onChange, mathOnly = false }: Props) => {
  const { t } = useTranslation();
  const set = (patch: Partial<TextRunStyle>) => onChange({ ...style, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        className={toggleClass(style.color !== undefined)}
        onClick={() => set({ color: style.color === undefined ? '#2563eb' : undefined })}
      >
        <Palette size={14} aria-hidden />
        {t('richText.color')}
      </button>
      {style.color !== undefined ? (
        <ColorInput
          compact
          ariaLabel={t('richText.color')}
          value={style.color}
          onChange={(color) => set({ color })}
        />
      ) : null}
      {mathOnly ? null : (
        <>
          <button
            type="button"
            className={toggleClass(style.fontWeight === 700)}
            onClick={() => set({ fontWeight: style.fontWeight === 700 ? undefined : 700 })}
          >
            <Bold size={14} aria-hidden />
            {t('richText.bold')}
          </button>
          <button
            type="button"
            className={toggleClass(style.highlight !== undefined)}
            onClick={() =>
              set({ highlight: style.highlight === undefined ? '#fde047' : undefined })
            }
          >
            <Highlighter size={14} aria-hidden />
            {t('richText.highlight')}
          </button>
          {style.highlight !== undefined ? (
            <ColorInput
              compact
              ariaLabel={t('richText.highlight')}
              value={style.highlight}
              onChange={(highlight) => set({ highlight })}
            />
          ) : null}
        </>
      )}
    </div>
  );
};
