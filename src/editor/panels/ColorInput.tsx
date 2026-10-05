import { useTranslation } from 'react-i18next';
import {
  PALETTE_TOKENS,
  resolveColor,
  resolveTheme,
  themeColorRef,
} from '../../video/themes/themes';
import { useEditorStore } from '../store/editorStore';
import { cn } from '../ui/cn';

type Props = {
  value: string;
  onChange: (value: string) => void;
  testId?: string;
  ariaLabel?: string;
  /** Sans pastilles (barres d'outils étroites). */
  compact?: boolean;
};

const HEX = /^#[0-9a-f]{6}$/i;

const swatchClass = (active: boolean) =>
  cn(
    'h-5 w-5 rounded-full border',
    active ? 'border-sky-400 ring-2 ring-sky-400/60' : 'border-slate-600 hover:border-slate-300',
  );

/**
 * Choix d'une couleur : couleur libre, ou couleur du thème (elle suivra le thème si on en
 * change), ou couleur du kit de marque.
 */
export const ColorInput = ({ value, onChange, testId, ariaLabel, compact = false }: Props) => {
  const { t } = useTranslation();
  const themeId = useEditorStore((state) => state.project?.themeId ?? 'minimal-light');
  const overrides = useEditorStore((state) => state.project?.themeOverrides);
  const brandColors = useEditorStore((state) => state.project?.brand?.colors);
  const theme = resolveTheme(themeId, overrides ?? {});
  const shown = resolveColor(value, theme);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        type="color"
        data-testid={testId}
        aria-label={ariaLabel}
        className="h-8 w-10 shrink-0 rounded border border-slate-700 bg-slate-900 p-0.5"
        value={HEX.test(shown) ? shown : '#000000'}
        onChange={(event) => onChange(event.target.value)}
      />
      {compact
        ? null
        : PALETTE_TOKENS.map((token) => {
            const ref = themeColorRef(token);
            return (
              <button
                key={token}
                type="button"
                title={t(`themes.tokens.${token}`)}
                aria-label={t(`themes.tokens.${token}`)}
                className={swatchClass(value === ref)}
                style={{ backgroundColor: theme.palette[token] }}
                onClick={() => onChange(ref)}
              />
            );
          })}
      {compact
        ? null
        : (brandColors ?? []).map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              title={t('brand.color')}
              aria-label={t('brand.color')}
              className={cn(swatchClass(value === color), 'rounded-sm')}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
    </div>
  );
};
