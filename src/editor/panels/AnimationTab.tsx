import { useTranslation } from 'react-i18next';
import type { AnimationRef, SceneElement } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { AnimationSlot } from './AnimationSlot';
import { EmphasisList } from './animation/EmphasisList';
import { KeyframesEditor } from './animation/KeyframesEditor';
import { SoundSlot } from './SoundSlot';

type Props = { element: SceneElement; fps: number };

/** Onglet Animation : Apparition, Mises en valeur et mouvements, Disparition, son, mode Avancé. */
export const AnimationTab = ({ element, fps }: Props) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const advancedMode = useEditorStore((state) => state.advancedMode);
  const setAdvancedMode = useEditorStore((state) => state.setAdvancedMode);

  const setSlot = (slot: 'enter' | 'exit', value: AnimationRef | undefined) =>
    updateElement(element.id, (draft) => {
      if (value) draft.animations[slot] = value;
      else if (slot === 'enter') delete draft.animations.enter;
      else delete draft.animations.exit;
    });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-slate-400">{t('animation.help')}</p>
      <AnimationSlot
        category="enter"
        element={element}
        value={element.animations.enter}
        fps={fps}
        onChange={(value) => setSlot('enter', value)}
      />
      <EmphasisList element={element} fps={fps} />
      <AnimationSlot
        category="exit"
        element={element}
        value={element.animations.exit}
        fps={fps}
        onChange={(value) => setSlot('exit', value)}
      />
      <SoundSlot element={element} />
      <label className="flex items-center gap-2 text-xs text-slate-300">
        <input
          type="checkbox"
          data-testid="advanced-mode"
          className="h-4 w-4 accent-sky-500"
          checked={advancedMode}
          onChange={(event) => setAdvancedMode(event.target.checked)}
        />
        {t('animation.advancedMode')}
      </label>
      {advancedMode ? <KeyframesEditor element={element} fps={fps} /> : null}
    </div>
  );
};
