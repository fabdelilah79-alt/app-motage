import { Mic, Square, Timer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sceneDurationForVoice } from '../../shared/audioMix';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { api } from '../api/client';
import { useEditorStore } from '../store/editorStore';
import { useCurrentScene, useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { NumberInput } from '../ui/number-input';
import { Textarea } from '../ui/textarea';
import { useVoiceRecorder, type Recording } from './useVoiceRecorder';

/** Voix off de la scène : texte à lire, enregistrement au micro, réglages, calage de la durée. */
export const VoiceoverSection = () => {
  const { t } = useTranslation();
  const project = useProject();
  const scene = useCurrentScene();
  const addAsset = useEditorStore((state) => state.addAsset);
  const updateScene = useEditorStore((state) => state.updateScene);
  const setSceneDuration = useEditorStore((state) => state.setSceneDuration);
  const [uploadFailed, setUploadFailed] = useState(false);
  const { fps } = project.format;
  const sceneIndex = project.scenes.findIndex((item) => item.id === scene?.id);

  const onRecorded = async ({ wav, durationInSeconds }: Recording) => {
    if (!scene) return;
    setUploadFailed(false);
    try {
      const name = t('audio.recordingName', { number: sceneIndex + 1 }) + '.wav';
      const asset = await api.uploadMedia(project.id, wav, name, { durationInSeconds });
      addAsset(asset);
      updateScene(scene.id, (draft) => {
        draft.voiceover = { assetId: asset.id, volume: 1, offset: 0 };
      });
    } catch {
      setUploadFailed(true);
    }
  };
  const recorder = useVoiceRecorder((recording) => void onRecorded(recording));

  if (!scene) return null;
  const voice = scene.voiceover;
  const asset = voice ? project.assets.find((item) => item.id === voice.assetId) : undefined;
  const voiceSeconds = asset?.meta.durationInSeconds;
  const recording = recorder.state === 'recording';

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold text-slate-300">
        {t('audio.voiceover', { number: sceneIndex + 1 })}
      </h3>
      <Field label={t('audio.script')}>
        <Textarea
          dir="auto"
          placeholder={t('audio.scriptPlaceholder')}
          value={scene.script ?? ''}
          onChange={(event) =>
            updateScene(scene.id, (draft) => {
              draft.script = event.target.value;
            })
          }
        />
      </Field>
      <Button
        variant={recording ? 'danger' : 'primary'}
        data-testid="record-voice"
        disabled={recorder.state === 'processing'}
        onClick={() => (recording ? recorder.stop() : void recorder.start())}
      >
        {recording ? <Square size={14} aria-hidden /> : <Mic size={14} aria-hidden />}
        {recording
          ? t('audio.stop', { seconds: recorder.elapsed.toFixed(1) })
          : t(voice ? 'audio.recordAgain' : 'audio.record')}
      </Button>
      {recorder.state === 'denied' ? (
        <p className="text-xs text-rose-400">{t('audio.micDenied')}</p>
      ) : null}
      {recorder.state === 'error' || uploadFailed ? (
        <p className="text-xs text-rose-400">{t('audio.recordFailed')}</p>
      ) : null}
      {voice ? (
        <div
          className="flex flex-col gap-2 rounded-md border border-slate-800 p-2"
          data-testid="voiceover"
        >
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate" dir="auto">
              {asset?.name} {voiceSeconds ? `· ${voiceSeconds.toFixed(1)} s` : ''}
            </span>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('audio.remove')}
              onClick={() => updateScene(scene.id, (draft) => void (draft.voiceover = undefined))}
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
                value={Math.round(voice.volume * 100)}
                onValueChange={(value) =>
                  updateScene(scene.id, (draft) => {
                    if (draft.voiceover) draft.voiceover.volume = value / 100;
                  })
                }
              />
            </Field>
            <Field label={t('fields.inSeconds', { label: t('audio.offset') })}>
              <NumberInput
                min={0}
                step={0.1}
                value={Number(framesToSeconds(voice.offset, fps).toFixed(2))}
                onValueChange={(value) =>
                  updateScene(scene.id, (draft) => {
                    if (draft.voiceover) draft.voiceover.offset = secondsToFrames(value, fps);
                  })
                }
              />
            </Field>
          </div>
          <Button
            size="sm"
            data-testid="fit-scene-to-voice"
            disabled={!voiceSeconds}
            onClick={() =>
              voiceSeconds &&
              setSceneDuration(scene.id, sceneDurationForVoice(voice.offset, voiceSeconds, fps))
            }
          >
            <Timer size={14} aria-hidden />
            {t('audio.fitScene')}
          </Button>
        </div>
      ) : null}
    </section>
  );
};
