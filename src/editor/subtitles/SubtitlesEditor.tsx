import { Plus, Trash2, Wand2, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { randomId } from '../../shared/factories';
import type { Scene, SubtitleCue } from '../../shared/schema';
import { captionsToCues, cuesFromScript } from '../../shared/subtitles';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { resolveAssetSrc } from '../../video/elements/resolveAssetSrc';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Button } from '../ui/button';
import { NumberInput } from '../ui/number-input';
import { Textarea } from '../ui/textarea';
import { SubtitleStyleFields } from './SubtitleStyleFields';
import { transcribeAudio, TranscriptionUnsupportedError, type TranscriptionStage } from './transcribe';

type Status = { kind: 'idle' } | { kind: 'working'; stage: TranscriptionStage; progress: number } | { kind: 'error'; key: string };

/** Sous-titres de la scène : saisie, création depuis le script, transcription automatique locale. */
export const SubtitlesEditor = ({ scene, fps }: { scene: Scene; fps: number }) => {
  const { t } = useTranslation();
  const project = useProject();
  const updateScene = useEditorStore((state) => state.updateScene);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const edit = (recipe: (cues: SubtitleCue[]) => void) => updateScene(scene.id, (draft) => recipe(draft.subtitles));
  const editCue = (index: number, recipe: (cue: SubtitleCue) => void) =>
    edit((cues) => {
      const cue = cues[index];
      if (cue) recipe(cue);
    });
  const voice = scene.voiceover ? project.assets.find((asset) => asset.id === scene.voiceover?.assetId) : undefined;

  const transcribe = async () => {
    if (!voice || !scene.voiceover) return;
    const offset = scene.voiceover.offset;
    try {
      setStatus({ kind: 'working', stage: 'download', progress: 0 });
      const url = resolveAssetSrc(voice, { projectId: project.id, filesBaseUrl: '' });
      const captions = await transcribeAudio(url, project.defaultLang, (stage, progress) => setStatus({ kind: 'working', stage, progress }));
      // La voix commence `offset` frames après le début de la scène.
      const cues = captionsToCues(captions, fps, -offset);
      edit((draft) => void draft.splice(0, draft.length, ...cues));
      setStatus({ kind: 'idle' });
    } catch (error) {
      setStatus({ kind: 'error', key: error instanceof TranscriptionUnsupportedError ? 'subtitles.unsupported' : 'subtitles.failed' });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('subtitles.title')}</p>
      {scene.subtitles.map((cue, index) => (
        <div key={cue.id} className="flex flex-col gap-1 rounded-md border border-slate-700 p-2">
          <Textarea
            dir="auto"
            className="min-h-14"
            aria-label={t('subtitles.text')}
            value={cue.text}
            onChange={(event) => editCue(index, (item) => void (item.text = event.target.value))}
          />
          <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
            <NumberInput aria-label={t('subtitles.from')} min={0} step={0.1} value={framesToSeconds(cue.from, fps)} onValueChange={(s) => editCue(index, (item) => void (item.from = Math.max(0, secondsToFrames(s, fps))))} />
            <NumberInput aria-label={t('subtitles.to')} min={0} step={0.1} value={framesToSeconds(cue.to, fps)} onValueChange={(s) => editCue(index, (item) => void (item.to = Math.max(0, secondsToFrames(s, fps))))} />
            <Button size="icon" variant="ghost" aria-label={t('subtitles.remove')} onClick={() => edit((cues) => void cues.splice(index, 1))}>
              <Trash2 size={14} aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          data-testid="add-subtitle"
          onClick={() => {
            const last = scene.subtitles[scene.subtitles.length - 1];
            const from = last ? last.to : 0;
            edit((cues) => void cues.push({ id: `sub-${randomId()}`, from, to: Math.min(scene.durationInFrames, from + fps * 3), text: '' }));
          }}
        >
          <Plus size={14} aria-hidden />
          {t('subtitles.add')}
        </Button>
        <Button
          size="sm"
          disabled={!scene.script?.trim()}
          data-testid="subtitles-from-script"
          onClick={() => edit((cues) => void cues.splice(0, cues.length, ...cuesFromScript(scene.script ?? '', scene.durationInFrames)))}
        >
          <FileText size={14} aria-hidden />
          {t('subtitles.fromScript')}
        </Button>
        <Button size="sm" disabled={!voice || status.kind === 'working'} onClick={() => void transcribe()}>
          <Wand2 size={14} aria-hidden />
          {t('subtitles.transcribe')}
        </Button>
      </div>
      {status.kind === 'working' ? (
        <p className="text-xs text-sky-300" role="status">
          {t(`subtitles.stages.${status.stage}`, { percent: Math.round(status.progress * 100) })}
        </p>
      ) : null}
      {status.kind === 'error' ? <p className="text-xs text-rose-300" role="alert">{t(status.key)}</p> : null}
      <p className="text-[11px] text-slate-500">{t('subtitles.help')}</p>
      <SubtitleStyleFields />
    </div>
  );
};
