import { useTranslation } from 'react-i18next';
import type { DiagramElement } from '../../../shared/schema';
import { getDiagram } from '../../../video/science/diagrams/registry';
import { useEditorStore } from '../../store/editorStore';
import { Field } from '../../ui/field';
import { NativeSelect } from '../../ui/native-select';
import { NumberInput } from '../../ui/number-input';

/** Réglages propres au schéma (nombre de spires, angle du plan, interrupteur fermé…). */
export const DiagramParamsEditor = ({ element }: { element: DiagramElement }) => {
  const { t, i18n } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const diagram = getDiagram(element.diagramId);
  if (!diagram) return null;
  const lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';
  const set = (key: string, value: number | string | boolean) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'diagram') draft.params[key] = value;
    });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-slate-200">{diagram.name[lang]}</p>
      {diagram.params.map((field) => {
        const value = element.params[field.key] ?? field.default;
        const label = t(`science.diagramParams.${field.key}`);
        switch (field.kind) {
          case 'number':
            return (
              <Field key={field.key} label={label}>
                <NumberInput min={field.min} max={field.max} step={field.step} value={Number(value)} onValueChange={(next) => set(field.key, Math.min(field.max, Math.max(field.min, next)))} />
              </Field>
            );
          case 'boolean':
            return (
              <label key={field.key} className="flex items-center gap-2 text-xs text-slate-300">
                <input type="checkbox" className="h-4 w-4 accent-sky-500" checked={value === true} onChange={(event) => set(field.key, event.target.checked)} />
                {label}
              </label>
            );
          case 'select':
            return (
              <Field key={field.key} label={label}>
                <NativeSelect
                  value={String(value)}
                  options={field.options.map((option) => ({ value: option, label: t(`science.diagramOptions.${option}`) }))}
                  onChange={(event) => set(field.key, event.target.value)}
                />
              </Field>
            );
        }
      })}
    </div>
  );
};
