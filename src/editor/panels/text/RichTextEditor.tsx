import { Plus, Sigma } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CalloutElement, TextElement, TextRun } from '../../../shared/schema';
import { useEditorStore } from '../../store/editorStore';
import { Button } from '../../ui/button';
import { RunEditor } from './RunEditor';

const SAMPLE_LATEX = 'v = \\frac{d}{t}';

/** Contenu d'un texte riche : segments de texte stylés et formules en ligne. */
export const RichTextEditor = ({ element }: { element: TextElement | CalloutElement }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);

  const editRuns = (recipe: (runs: TextRun[]) => void) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'text' || draft.type === 'callout') recipe(draft.content);
    });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-slate-400">{t('richText.help')}</p>
      {element.content.map((run, index) => (
        <RunEditor
          key={index}
          run={run}
          canRemove={element.content.length > 1}
          onChange={(next) =>
            editRuns((runs) => {
              runs[index] = next;
            })
          }
          onRemove={() => editRuns((runs) => void runs.splice(index, 1))}
        />
      ))}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => editRuns((runs) => void runs.push({ kind: 'text', text: ' ' }))}
        >
          <Plus size={14} aria-hidden />
          {t('richText.addText')}
        </Button>
        <Button
          size="sm"
          data-testid="add-formula"
          onClick={() => editRuns((runs) => void runs.push({ kind: 'math', latex: SAMPLE_LATEX }))}
        >
          <Sigma size={14} aria-hidden />
          {t('richText.addFormula')}
        </Button>
      </div>
    </div>
  );
};
