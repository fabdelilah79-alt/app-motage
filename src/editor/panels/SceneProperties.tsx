import { useTranslation } from 'react-i18next';
import type { Scene } from '../../shared/schema';
import { framesToSeconds } from '../../shared/time';
import { useEditorStore } from '../store/editorStore';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { NumberInput } from '../ui/number-input';
import { BackgroundFields } from './BackgroundFields';
import { CameraEditor } from './CameraEditor';
import { TransitionFields } from './TransitionFields';
import { SubtitlesEditor } from '../subtitles/SubtitlesEditor';

type Props = { scene: Scene; index: number; fps: number };

/** Propriétés de la scène (quand aucun élément n'est sélectionné). */
export const SceneProperties = ({ scene, index, fps }: Props) => {
  const { t } = useTranslation();
  const updateScene = useEditorStore((state) => state.updateScene);
  const setSceneDuration = useEditorStore((state) => state.setSceneDuration);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto p-3">
      <h2 className="text-sm font-semibold">{t('scene.title', { number: index + 1 })}</h2>
      <Field label={t('scene.name')}>
        <Input
          value={scene.name}
          placeholder={t('scene.namePlaceholder')}
          onChange={(event) =>
            updateScene(scene.id, (draft) => {
              draft.name = event.target.value;
            })
          }
        />
      </Field>
      <Field label={t('fields.inSeconds', { label: t('fields.duration') })}>
        <NumberInput
          data-testid="scene-duration"
          min={0.5}
          step={0.5}
          value={Number(framesToSeconds(scene.durationInFrames, fps).toFixed(2))}
          onValueChange={(seconds) => setSceneDuration(scene.id, Math.max(1, seconds * fps))}
        />
      </Field>
      <BackgroundFields
        background={scene.background}
        onChange={(background) =>
          updateScene(scene.id, (draft) => {
            draft.background = background;
          })
        }
      />
      {index > 0 ? (
        <TransitionFields
          transition={scene.transitionIn}
          fps={fps}
          onChange={(transition) =>
            updateScene(scene.id, (draft) => {
              draft.transitionIn = transition;
            })
          }
        />
      ) : null}
      <CameraEditor scene={scene} fps={fps} />
      <SubtitlesEditor scene={scene} fps={fps} />
      <p className="text-xs text-slate-400">{t('scene.help')}</p>
    </div>
  );
};
