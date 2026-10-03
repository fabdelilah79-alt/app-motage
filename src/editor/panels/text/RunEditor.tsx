import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TextRun } from '../../../shared/schema';
import { InlineMath } from '../../../video/science/InlineMath';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { RunStyleBar } from './RunStyleBar';

type Props = {
  run: TextRun;
  onChange: (run: TextRun) => void;
  onRemove: () => void;
  canRemove: boolean;
};

/** Un segment du texte : texte stylé ou formule LaTeX (avec aperçu). */
export const RunEditor = ({ run, onChange, onRemove, canRemove }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/40 p-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {run.kind === 'math' ? t('richText.formula') : t('richText.text')}
        </span>
        {canRemove ? (
          <Button size="icon" variant="ghost" onClick={onRemove} aria-label={t('richText.remove')}>
            <Trash2 size={14} aria-hidden />
          </Button>
        ) : null}
      </div>
      {run.kind === 'text' ? (
        <>
          <Textarea
            dir="auto"
            data-testid="run-text"
            value={run.text}
            onChange={(event) => onChange({ ...run, text: event.target.value })}
          />
          <RunStyleBar style={run.style ?? {}} onChange={(style) => onChange({ ...run, style })} />
        </>
      ) : (
        <>
          <Input
            dir="ltr"
            className="font-mono"
            data-testid="run-latex"
            value={run.latex}
            onChange={(event) => onChange({ ...run, latex: event.target.value })}
          />
          <div className="overflow-x-auto rounded-md bg-white p-2 text-lg text-slate-900">
            <InlineMath latex={run.latex} />
          </div>
          <p className="text-[11px] text-slate-500">{t('richText.latexHelp')}</p>
          <RunStyleBar
            mathOnly
            style={run.style ?? {}}
            onChange={(style) => onChange({ ...run, style: { color: style.color } })}
          />
        </>
      )}
    </div>
  );
};
