import { useTranslation } from 'react-i18next';
import type { AnimationRef, SceneElement } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { AnimationSlot } from './AnimationSlot';

type Props = { element: SceneElement; fps: number };

/** Onglet Animation : Apparition et Disparition (les mises en valeur arrivent en phase 5). */
export const AnimationTab = ({ element, fps }: Props) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);

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
      <AnimationSlot
        category="exit"
        element={element}
        value={element.animations.exit}
        fps={fps}
        onChange={(value) => setSlot('exit', value)}
      />
    </div>
  );
};
