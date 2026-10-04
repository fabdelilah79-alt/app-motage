import { useTranslation } from 'react-i18next';
import { SFX_IDS, type SceneElement, type SfxId } from '../../shared/schema';
import { useEditorStore } from '../store/editorStore';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';
import { NumberInput } from '../ui/number-input';

const NONE = '';

/** Effet sonore joué quand l'élément apparaît (whoosh, pop, clic, ding). */
export const SoundSlot = ({ element }: { element: SceneElement }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const sound = element.sound;

  const setSfx = (value: string) =>
    updateElement(element.id, (draft) => {
      const sfx = SFX_IDS.find((id) => id === value);
      draft.sound = sfx ? { sfx: sfx as SfxId, volume: draft.sound?.volume ?? 0.8 } : undefined;
    });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 p-3">
      <Field label={t('animation.sound')}>
        <NativeSelect
          data-testid="animation-sound"
          value={sound?.sfx ?? NONE}
          options={[
            { value: NONE, label: t('animation.none') },
            ...SFX_IDS.map((id) => ({ value: id, label: t(`sfx.${id}`) })),
          ]}
          onChange={(event) => setSfx(event.target.value)}
        />
      </Field>
      {sound ? (
        <Field label={t('fields.inPercent', { label: t('audio.volume') })}>
          <NumberInput
            min={0}
            max={100}
            step={5}
            value={Math.round(sound.volume * 100)}
            onValueChange={(value) =>
              updateElement(element.id, (draft) => {
                if (draft.sound) draft.sound.volume = Math.min(1, Math.max(0, value / 100));
              })
            }
          />
        </Field>
      ) : null}
    </div>
  );
};
