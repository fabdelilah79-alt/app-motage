import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AnimationRef, SceneElement } from '../../../shared/schema';
import { getAnimationPreset } from '../../../video/animations/registry';
import type { UiLang } from '../../i18n';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { AnimationPicker } from './AnimationPicker';
import { newAnimationRef } from './newAnimationRef';
import { ParamsEditor } from './ParamsEditor';
import { TimingFields } from './TimingFields';

type Props = { element: SceneElement; fps: number };

/** Mises en valeur et mouvements : plusieurs à la suite, chacun avec son début et ses répétitions. */
export const EmphasisList = ({ element, fps }: Props) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const items = element.animations.emphasis;

  const edit = (recipe: (list: AnimationRef[]) => void) =>
    updateElement(element.id, (draft) => recipe(draft.animations.emphasis));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-800 p-3">
      <span className="text-xs text-slate-400">{t('animation.emphasis')}</span>
      {items.map((item, index) => {
        const preset = getAnimationPreset(item.presetId);
        return (
          <div key={index} className="flex flex-col gap-2 rounded-md bg-slate-950/50 p-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{preset?.name[i18n.language as UiLang] ?? item.presetId}</span>
              <Button
                size="icon"
                variant="ghost"
                aria-label={t('animation.remove')}
                onClick={() => edit((list) => void list.splice(index, 1))}
              >
                <Trash2 size={14} aria-hidden />
              </Button>
            </div>
            <TimingFields
              value={item}
              fps={fps}
              delayLabelKey="animation.start"
              showRepeat
              onChange={(next) =>
                edit((list) => {
                  list[index] = next;
                })
              }
            />
            {preset ? (
              <ParamsEditor
                preset={preset}
                params={item.params}
                onChange={(params) =>
                  edit((list) => {
                    const current = list[index];
                    if (current) list[index] = { ...current, params };
                  })
                }
              />
            ) : null}
          </div>
        );
      })}
      <AnimationPicker
        categories={['emphasis', 'motion']}
        elementType={element.type}
        value={undefined}
        label={t('animation.addEmphasis')}
        emptyText={t('animation.choose')}
        testId="add-emphasis"
        onChange={(presetId) => {
          const ref = presetId ? newAnimationRef(presetId, fps) : undefined;
          if (ref) edit((list) => void list.push(ref));
        }}
      />
    </div>
  );
};
