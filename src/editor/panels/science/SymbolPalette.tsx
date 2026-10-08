import { useTranslation } from 'react-i18next';
import { SYMBOL_GROUPS } from './symbols';

/** Boutons de symboles (fractions, vecteurs, dérivées, grec, unités, flèches de réaction). */
export const SymbolPalette = ({ onInsert }: { onInsert: (latex: string) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-1.5" dir="ltr">
      {SYMBOL_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-0.5 text-[10px] text-slate-400" dir="auto">
            {t(`science.symbolGroups.${group.id}`)}
          </p>
          <div className="flex flex-wrap gap-1">
            {group.symbols.map((symbol) => (
              <button
                key={symbol.latex}
                type="button"
                title={symbol.latex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onInsert(symbol.latex)}
                className="min-w-7 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-100 hover:border-sky-400"
              >
                {symbol.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
