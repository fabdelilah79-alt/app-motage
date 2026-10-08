import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  EASING_IDS,
  KEYFRAME_PROPERTIES,
  type Keyframe,
  type KeyframeProperty,
  type SceneElement,
} from '../../../shared/schema';
import { formatSeconds, framesToSeconds, secondsToFrames } from '../../../shared/time';
import { usePlayerState } from '../../hooks/usePlayerFrame';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';
import { ColorInput } from '../ColorInput';

type Props = { element: SceneElement; fps: number };

/** Couleur de base d'un élément (pour les images clés de couleur). */
const baseColorOf = (element: SceneElement): string | undefined => {
  if (element.type === 'text') return element.style.color;
  if (element.type === 'shape') return element.fill;
  if (element.type === 'icon') return element.color;
  if (
    element.type === 'math' ||
    element.type === 'vector' ||
    element.type === 'dimension' ||
    element.type === 'diagram'
  ) {
    return element.color;
  }
  return undefined;
};

/** Valeur actuelle (sans images clés) d'une propriété. */
const baseValueOf = (element: SceneElement, property: KeyframeProperty): number | string => {
  const { transform } = element;
  switch (property) {
    case 'x':
      return transform.x;
    case 'y':
      return transform.y;
    case 'scale':
      return transform.scale;
    case 'rotation':
      return transform.rotation;
    case 'opacity':
      return transform.opacity;
    case 'color':
      return baseColorOf(element) ?? '#ffffff';
  }
};

/** Mode Avancé : images clés par propriété (position, échelle, rotation, opacité, couleur). */
export const KeyframesEditor = ({ element, fps }: Props) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const { frame } = usePlayerState();
  const local = Math.min(element.timing.duration - 1, Math.max(0, frame - element.timing.from));
  const properties = KEYFRAME_PROPERTIES.filter(
    (property) => property !== 'color' || baseColorOf(element) !== undefined,
  );

  const edit = (property: KeyframeProperty, recipe: (list: Keyframe[]) => void) =>
    updateElement(element.id, (draft) => {
      const all = draft.keyframes ?? {};
      const list = [...(all[property] ?? [])];
      recipe(list);
      list.sort((a, b) => a.frame - b.frame);
      draft.keyframes = { ...all, [property]: list.length > 0 ? list : undefined };
    });

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-900/60 p-3" data-testid="keyframes">
      <p className="text-xs text-slate-400">{t('keyframes.help')}</p>
      {properties.map((property) => {
        const list = element.keyframes?.[property] ?? [];
        return (
          <section key={property} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">
                {t(`keyframes.properties.${property}`)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                data-testid={`add-keyframe-${property}`}
                onClick={() =>
                  edit(property, (items) => {
                    const value = baseValueOf(element, property);
                    const others = items.filter((item) => item.frame !== local);
                    items.splice(0, items.length, ...others, { frame: local, value, easing: 'smooth' });
                  })
                }
              >
                <Plus size={12} aria-hidden />
                {t('keyframes.addAt', { time: formatSeconds(local, fps, i18n.language) })}
              </Button>
            </div>
            {list.map((item, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1.5">
                <NumberInput
                  aria-label={t('keyframes.time')}
                  min={0}
                  step={0.1}
                  value={Number(framesToSeconds(item.frame, fps).toFixed(2))}
                  onValueChange={(seconds) =>
                    edit(property, (items) => {
                      const current = items[index];
                      if (current) items[index] = { ...current, frame: secondsToFrames(seconds, fps) };
                    })
                  }
                />
                {property === 'color' ? (
                  <ColorInput
                    compact
                    ariaLabel={t('keyframes.value')}
                    value={String(item.value)}
                    onChange={(value) =>
                      edit(property, (items) => {
                        const current = items[index];
                        if (current) items[index] = { ...current, value };
                      })
                    }
                  />
                ) : (
                  <NumberInput
                    aria-label={t('keyframes.value')}
                    step={property === 'scale' || property === 'opacity' ? 0.05 : 1}
                    value={typeof item.value === 'number' ? item.value : 0}
                    onValueChange={(value) =>
                      edit(property, (items) => {
                        const current = items[index];
                        if (current) items[index] = { ...current, value };
                      })
                    }
                  />
                )}
                <NativeSelect
                  aria-label={t('animation.easing')}
                  value={item.easing}
                  options={EASING_IDS.map((id) => ({ value: id, label: t(`animation.easings.${id}`) }))}
                  onChange={(event) => {
                    const easing = EASING_IDS.find((id) => id === event.target.value);
                    edit(property, (items) => {
                      const current = items[index];
                      if (current && easing) items[index] = { ...current, easing };
                    });
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t('keyframes.remove')}
                  onClick={() => edit(property, (items) => void items.splice(index, 1))}
                >
                  <Trash2 size={14} aria-hidden />
                </Button>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
};
