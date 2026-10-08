import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { MathElement, MathStep } from '../../../shared/schema';
import { framesToSeconds, secondsToFrames } from '../../../shared/time';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';

/**
 * Étapes de calcul : à un instant donné, l'équation se transforme en une autre
 * (les termes communs glissent, les autres apparaissent ou disparaissent).
 */
export const MathStepsEditor = ({ element, fps }: { element: MathElement; fps: number }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);

  const edit = (recipe: (steps: MathStep[]) => void) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'math') recipe(draft.steps);
    });

  const addStep = () =>
    edit((steps) => {
      const last = steps[steps.length - 1];
      steps.push({
        latex: last?.latex ?? element.latex,
        at: (last ? last.at + last.duration : 0) + fps * 2,
        duration: Math.round(fps * 0.8),
      });
    });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-slate-300">{t('science.steps')}</p>
      <p className="text-[11px] text-slate-400">{t('science.stepsHelp')}</p>
      {element.steps.map((step, index) => (
        <div key={index} className="flex flex-col gap-1.5 rounded-md border border-slate-700 p-2">
          <Input
            dir="ltr"
            className="font-mono"
            aria-label={t('science.latex')}
            value={step.latex}
            onChange={(event) =>
              edit((steps) => {
                const current = steps[index];
                if (current) current.latex = event.target.value;
              })
            }
          />
          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <Field label={t('science.stepAt')}>
              <NumberInput
                min={0}
                step={0.1}
                value={framesToSeconds(step.at, fps)}
                onValueChange={(seconds) =>
                  edit((steps) => {
                    const current = steps[index];
                    if (current) current.at = Math.max(0, secondsToFrames(seconds, fps));
                  })
                }
              />
            </Field>
            <Field label={t('fields.duration')}>
              <NumberInput
                min={0.1}
                step={0.1}
                value={framesToSeconds(step.duration, fps)}
                onValueChange={(seconds) =>
                  edit((steps) => {
                    const current = steps[index];
                    if (current) current.duration = Math.max(1, secondsToFrames(seconds, fps));
                  })
                }
              />
            </Field>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t('science.removeStep')}
              onClick={() => edit((steps) => void steps.splice(index, 1))}
            >
              <Trash2 size={14} aria-hidden />
            </Button>
          </div>
        </div>
      ))}
      <Button size="sm" className="self-start" onClick={addStep} data-testid="add-math-step">
        <Plus size={14} aria-hidden />
        {t('science.addStep')}
      </Button>
    </div>
  );
};
