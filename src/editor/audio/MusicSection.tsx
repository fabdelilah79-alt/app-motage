import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { NumberInput } from '../ui/number-input';

const percent = (value: number) => Math.round(value * 100);

/** Musiques de fond : volume, fondus, atténuation automatique pendant les voix off. */
export const MusicSection = () => {
  const { t } = useTranslation();
  const project = useProject();
  const updateProject = useEditorStore((state) => state.updateProject);
  const { fps } = project.format;

  type Track = (typeof project.audioTracks)[number];
  const editTrack = (index: number, recipe: (track: Track) => void) =>
    updateProject((draft) => {
      const track = draft.audioTracks[index];
      if (track) recipe(track);
    });

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-slate-300">{t('audio.music')}</h3>
      {project.audioTracks.length === 0 ? (
        <p className="text-xs text-slate-400">{t('audio.musicHelp')}</p>
      ) : null}
      {project.audioTracks.map((track, index) => {
        const asset = project.assets.find((item) => item.id === track.assetId);
        return (
          <div
            key={track.id}
            className="flex flex-col gap-2 rounded-md border border-slate-800 p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-xs" dir="auto">
                {asset?.name ?? track.assetId}
              </span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('audio.remove')}
                onClick={() => updateProject((draft) => void draft.audioTracks.splice(index, 1))}
              >
                <Trash2 size={14} aria-hidden />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('fields.inPercent', { label: t('audio.volume') })}>
                <NumberInput
                  min={0}
                  max={100}
                  step={5}
                  value={percent(track.volume)}
                  onValueChange={(value) =>
                    editTrack(index, (item) => void (item.volume = value / 100))
                  }
                />
              </Field>
              <Field label={t('fields.inPercent', { label: t('audio.duckLevel') })}>
                <NumberInput
                  min={0}
                  max={100}
                  step={5}
                  value={percent(track.ducking.level)}
                  disabled={!track.ducking.enabled}
                  onValueChange={(value) =>
                    editTrack(index, (item) => void (item.ducking.level = value / 100))
                  }
                />
              </Field>
              <Field label={t('fields.inSeconds', { label: t('audio.fadeIn') })}>
                <NumberInput
                  min={0}
                  step={0.5}
                  value={framesToSeconds(track.fadeIn, fps)}
                  onValueChange={(value) =>
                    editTrack(index, (item) => void (item.fadeIn = secondsToFrames(value, fps)))
                  }
                />
              </Field>
              <Field label={t('fields.inSeconds', { label: t('audio.fadeOut') })}>
                <NumberInput
                  min={0}
                  step={0.5}
                  value={framesToSeconds(track.fadeOut, fps)}
                  onValueChange={(value) =>
                    editTrack(index, (item) => void (item.fadeOut = secondsToFrames(value, fps)))
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4 accent-sky-500"
                checked={track.ducking.enabled}
                onChange={(event) =>
                  editTrack(index, (item) => void (item.ducking.enabled = event.target.checked))
                }
              />
              {t('audio.ducking')}
            </label>
          </div>
        );
      })}
    </section>
  );
};
