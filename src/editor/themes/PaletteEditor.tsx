import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PALETTE_TOKENS, resolveTheme } from '../../video/themes/themes';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Button } from '../ui/button';

/** Couleurs du thème modifiables pour ce projet (les éléments qui les utilisent suivent). */
export const PaletteEditor = () => {
  const { t } = useTranslation();
  const project = useProject();
  const setThemeColor = useEditorStore((state) => state.setThemeColor);
  const theme = resolveTheme(project.themeId, project.themeOverrides);
  const hasOverrides = Object.keys(project.themeOverrides).length > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400">{t('themes.paletteHelp')}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PALETTE_TOKENS.map((token) => (
          <label key={token} className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="color"
              data-testid={`palette-${token}`}
              className="h-8 w-10 rounded border border-slate-700 bg-slate-900 p-0.5"
              value={theme.palette[token]}
              onChange={(event) => setThemeColor(token, event.target.value)}
            />
            {t(`themes.tokens.${token}`)}
          </label>
        ))}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="self-start"
        disabled={!hasOverrides}
        onClick={() => PALETTE_TOKENS.forEach((token) => setThemeColor(token, undefined))}
      >
        <RotateCcw size={14} aria-hidden />
        {t('themes.resetPalette')}
      </Button>
    </div>
  );
};
