import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ChartElement } from '../../../shared/schema';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { NumberInput } from '../../ui/number-input';
import { Textarea } from '../../ui/textarea';

/** Données du graphique : libellés et valeurs, ou valeurs brutes pour un histogramme. */
export const ChartItemsEditor = ({ element }: { element: ChartElement }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const edit = (recipe: (chart: ChartElement) => void) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'chart') recipe(draft);
    });

  if (element.chartKind === 'histogram') {
    return (
      <div className="flex flex-col gap-2">
        <Field label={t('science.rawValues')} hint={t('science.rawValuesHelp')}>
          <Textarea
            key={element.id}
            dir="ltr"
            className="font-mono"
            defaultValue={element.values.join('\n')}
            onBlur={(event) => {
              const values = event.target.value
                .split(/[\s;]+/)
                .map((part) => Number(part.replace(',', '.')))
                .filter((value) => Number.isFinite(value) && event.target.value.trim() !== '');
              edit((chart) => void (chart.values = values));
            }}
          />
        </Field>
        <Field label={t('science.bins')}>
          <NumberInput min={1} max={40} step={1} value={element.bins} onValueChange={(bins) => edit((chart) => void (chart.bins = Math.min(40, Math.max(1, Math.round(bins)))))} />
        </Field>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-slate-300">{t('science.chartData')}</p>
      {element.items.map((item, index) => (
        <div key={index} className="grid grid-cols-[1fr_6rem_auto] items-center gap-1.5">
          <Input
            dir="auto"
            aria-label={t('science.itemLabel')}
            value={item.label}
            onChange={(event) =>
              edit((chart) => {
                const current = chart.items[index];
                if (current) current.label = event.target.value;
              })
            }
          />
          <NumberInput
            aria-label={t('science.itemValue')}
            step={1}
            value={item.value}
            onValueChange={(value) =>
              edit((chart) => {
                const current = chart.items[index];
                if (current) current.value = value;
              })
            }
          />
          <Button size="icon" variant="ghost" aria-label={t('science.removeItem')} onClick={() => edit((chart) => void chart.items.splice(index, 1))}>
            <Trash2 size={14} aria-hidden />
          </Button>
        </div>
      ))}
      <Button size="sm" className="self-start" onClick={() => edit((chart) => void chart.items.push({ label: String.fromCharCode(65 + chart.items.length % 26), value: 5 }))}>
        <Plus size={14} aria-hidden />
        {t('science.addItem')}
      </Button>
    </div>
  );
};
