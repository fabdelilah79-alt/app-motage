import { Pause, Play, SkipBack } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatSeconds } from '../../shared/time';
import { usePlayerRef } from '../canvas/PlayerContext';
import { Button } from '../ui/button';

type Props = { frame: number; playing: boolean; durationInFrames: number; fps: number };

/** Lecture / pause, retour au début, temps écoulé / durée (en secondes). */
export const PlaybackControls = ({ frame, playing, durationInFrames, fps }: Props) => {
  const { t, i18n } = useTranslation();
  const playerRef = usePlayerRef();
  const elapsed = formatSeconds(frame, fps, i18n.language);
  const total = formatSeconds(durationInFrames, fps, i18n.language);

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        aria-label={t('timeline.toStart')}
        onClick={() => playerRef.current?.seekTo(0)}
      >
        <SkipBack size={16} aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="primary"
        data-testid="play-toggle"
        aria-label={playing ? t('timeline.pause') : t('timeline.play')}
        onClick={() => playerRef.current?.toggle()}
      >
        {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
      </Button>
      <span className="ms-2 text-xs text-slate-300 tabular-nums" dir="ltr">
        {elapsed} / {total}
      </span>
    </div>
  );
};
