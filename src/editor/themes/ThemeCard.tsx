import { Thumbnail } from '@remotion/player';
import { Check } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '../../shared/schema';
import { ProjectVideo } from '../../video/ProjectVideo';
import { themePreviewProject } from '../../video/themes/themePreview';
import type { Theme } from '../../video/themes/themes';
import { cn } from '../ui/cn';

type Props = { theme: Theme; active: boolean; onSelect: () => void };

/** Vignette d'un thème : petite scène d'exemple rendue par Remotion. */
export const ThemeCard = ({ theme, active, onSelect }: Props) => {
  const { i18n } = useTranslation();
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';
  const inputProps = useMemo(
    () => ({ project: themePreviewProject(theme.id), filesBaseUrl: '' }),
    [theme.id],
  );
  const { format } = inputProps.project;

  return (
    <button
      type="button"
      data-testid={`theme-${theme.id}`}
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'relative flex flex-col gap-1.5 rounded-lg border p-1.5 text-start text-sm',
        active ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500',
      )}
    >
      <Thumbnail
        component={ProjectVideo}
        inputProps={inputProps}
        compositionWidth={format.width}
        compositionHeight={format.height}
        durationInFrames={30}
        fps={format.fps}
        frameToDisplay={29}
        style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 6 }}
      />
      <span className="flex items-center gap-1.5 px-1 font-medium">
        {active ? <Check size={14} className="text-sky-400" aria-hidden /> : null}
        {theme.name[lang]}
      </span>
      <span className="flex gap-1 px-1 pb-1">
        {(['accent1', 'accent2', 'accent3', 'text'] as const).map((token) => (
          <span
            key={token}
            className="h-3 w-3 rounded-full border border-slate-600"
            style={{ backgroundColor: theme.palette[token] }}
          />
        ))}
      </span>
    </button>
  );
};
