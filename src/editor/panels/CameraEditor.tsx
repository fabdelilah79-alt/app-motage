import { Plus, Trash2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CameraMove, Scene } from '../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../shared/time';
import { usePlayerState } from '../hooks/usePlayerFrame';
import { useEditorStore } from '../store/editorStore';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

const KINDS: readonly CameraMove['kind'][] = ['zoom', 'pan', 'travelling', 'reset'];

type Props = { scene: Scene; fps: number };

/** Caméra de la scène : zoom sur une zone, panoramique, travelling, retour au plan large. */
export const CameraEditor = ({ scene, fps }: Props) => {
  const { t } = useTranslation();
  const updateScene = useEditorStore((state) => state.updateScene);
  const { frame } = usePlayerState();

  const edit = (recipe: (moves: CameraMove[]) => void) =>
    updateScene(scene.id, (draft) => recipe(draft.camera));
  const editMove = (index: number, patch: Partial<CameraMove>) =>
    edit((moves) => {
      const current = moves[index];
      if (current) moves[index] = { ...current, ...patch };
    });

  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
        <Video size={14} aria-hidden />
        {t('camera.title')}
      </h3>
      <p className="text-xs text-slate-400">{t('camera.help')}</p>
      {scene.camera.map((move, index) => (
        <div key={move.id} className="grid grid-cols-2 gap-2 rounded-md border border-slate-800 p-2">
          <Field label={t('camera.kind')}>
            <NativeSelect
              value={move.kind}
              options={KINDS.map((kind) => ({ value: kind, label: t(`camera.kinds.${kind}`) }))}
              onChange={(event) => {
                const kind = KINDS.find((item) => item === event.target.value);
                if (kind) editMove(index, { kind });
              }}
            />
          </Field>
          <Field label={t('fields.inSeconds', { label: t('fields.start') })}>
            <NumberInput
              min={0}
              step={0.1}
              value={Number(framesToSeconds(move.from, fps).toFixed(2))}
              onValueChange={(seconds) => editMove(index, { from: secondsToFrames(seconds, fps) })}
            />
          </Field>
          <Field label={t('fields.inSeconds', { label: t('fields.duration') })}>
            <NumberInput
              min={0.1}
              step={0.1}
              value={Number(framesToSeconds(move.duration, fps).toFixed(2))}
              onValueChange={(seconds) =>
                editMove(index, { duration: Math.max(1, secondsToFrames(seconds, fps)) })
              }
            />
          </Field>
          {move.kind !== 'reset' ? (
            <>
              <Field label={t('camera.zoom')}>
                <NumberInput
                  min={1}
                  max={5}
                  step={0.1}
                  disabled={move.kind === 'pan'}
                  value={move.zoom}
                  onValueChange={(zoom) => editMove(index, { zoom: Math.min(5, Math.max(1, zoom)) })}
                />
              </Field>
              <Field label={t('camera.centerX')}>
                <NumberInput
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(move.centerX * 100)}
                  onValueChange={(value) => editMove(index, { centerX: value / 100 })}
                />
              </Field>
              <Field label={t('camera.centerY')}>
                <NumberInput
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(move.centerY * 100)}
                  onValueChange={(value) => editMove(index, { centerY: value / 100 })}
                />
              </Field>
            </>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="col-span-2"
            onClick={() => edit((moves) => void moves.splice(index, 1))}
          >
            <Trash2 size={14} aria-hidden />
            {t('camera.remove')}
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        data-testid="add-camera"
        onClick={() =>
          edit((moves) => {
            const from = Math.min(scene.durationInFrames - 1, frame);
            moves.push({
              id: `camera-${moves.length + 1}-${from}`,
              kind: moves.length === 0 ? 'zoom' : 'reset',
              from,
              duration: fps,
              easing: 'smooth',
              centerX: 0.5,
              centerY: 0.5,
              zoom: 1.6,
            });
          })
        }
      >
        <Plus size={14} aria-hidden />
        {t('camera.add')}
      </Button>
    </section>
  );
};
