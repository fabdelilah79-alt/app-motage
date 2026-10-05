import { Player, Thumbnail } from '@remotion/player';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AnimationPreset } from '../../../video/animations/types';
import {
  PREVIEW_DURATION,
  PREVIEW_FORMAT,
  previewFrame,
  previewProject,
} from '../../../video/gallery/previewProject';
import { ProjectVideo } from '../../../video/ProjectVideo';
import type { UiLang } from '../../i18n';
import { cn } from '../../ui/cn';

type Props = { preset: AnimationPreset; selected: boolean; onSelect: () => void };

/** Vignette d'un préréglage ; au survol, l'animation se joue en boucle. */
export const PresetTile = ({ preset, selected, onSelect }: Props) => {
  const { i18n } = useTranslation();
  const [hover, setHover] = useState(false);
  const inputProps = useMemo(() => ({ project: previewProject(preset), filesBaseUrl: '' }), [preset]);
  const media = {
    component: ProjectVideo,
    inputProps,
    compositionWidth: PREVIEW_FORMAT.width,
    compositionHeight: PREVIEW_FORMAT.height,
    durationInFrames: PREVIEW_DURATION,
    fps: PREVIEW_FORMAT.fps,
    style: { width: '100%', aspectRatio: '16 / 9' },
  };

  return (
    <button
      type="button"
      data-testid={`preset-${preset.id}`}
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className={cn(
        'flex flex-col gap-1 overflow-hidden rounded-md border p-1 text-start',
        selected ? 'border-sky-400 bg-sky-950/40' : 'border-slate-700 hover:border-slate-500',
      )}
    >
      <div className="overflow-hidden rounded bg-slate-100" dir="ltr">
        {hover ? (
          <Player {...media} autoPlay loop controls={false} acknowledgeRemotionLicense />
        ) : (
          <Thumbnail {...media} frameToDisplay={previewFrame(preset)} />
        )}
      </div>
      <span className="truncate px-0.5 text-[11px] text-slate-200">
        {preset.name[i18n.language as UiLang] ?? preset.name.fr}
      </span>
    </button>
  );
};
