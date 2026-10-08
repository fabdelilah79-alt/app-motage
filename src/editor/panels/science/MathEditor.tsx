import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { MathElement } from '../../../shared/schema';
import { texToLayout } from '../../../video/science/mathSvg';
import { useEditorStore } from '../../store/editorStore';
import { Field } from '../../ui/field';
import { Textarea } from '../../ui/textarea';
import { MathStepsEditor } from './MathStepsEditor';
import { SymbolPalette } from './SymbolPalette';
import { insertSnippet } from './symbols';

/** Équation : code LaTeX (aperçu en direct dans le canevas), palette de symboles, étapes. */
export const MathEditor = ({ element, fps }: { element: MathElement; fps: number }) => {
  const { t } = useTranslation();
  const updateElement = useEditorStore((state) => state.updateElement);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const valid = texToLayout(element.latex) !== null;

  const setLatex = (latex: string) =>
    updateElement(element.id, (draft) => {
      if (draft.type === 'math') draft.latex = latex;
    });

  const insert = (snippet: string) => {
    const field = textarea.current;
    const start = field?.selectionStart ?? element.latex.length;
    const end = field?.selectionEnd ?? element.latex.length;
    const { text, cursor } = insertSnippet(element.latex, start, end, snippet);
    setLatex(text);
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('science.latex')} hint={valid ? t('science.latexHelp') : t('science.latexError')}>
        <Textarea
          ref={textarea}
          dir="ltr"
          data-testid="math-latex"
          className="font-mono"
          value={element.latex}
          aria-invalid={!valid}
          onChange={(event) => setLatex(event.target.value)}
        />
      </Field>
      <SymbolPalette onInsert={insert} />
      <MathStepsEditor element={element} fps={fps} />
    </div>
  );
};
