import { Check, FilePlus2, LayoutTemplate } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '../../shared/schema';
import { TEMPLATES } from '../../shared/templates/registry';
import { cn } from '../ui/cn';

type Props = { value: string; onChange: (templateId: string) => void };

const cardClass = (active: boolean) =>
  cn(
    'flex items-start gap-2 rounded-lg border p-2.5 text-start text-sm',
    active ? 'border-sky-400 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500',
  );

/** Choix du point de départ : projet vide ou l'un des 8 modèles (contenu d'exemple à remplacer). */
export const TemplatePicker = ({ value, onChange }: Props) => {
  const { t, i18n } = useTranslation();
  const lang: Lang = i18n.language === 'ar' || i18n.language === 'en' ? i18n.language : 'fr';
  return (
    <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
      <button type="button" data-testid="template-blank" aria-pressed={value === ''} className={cardClass(value === '')} onClick={() => onChange('')}>
        <FilePlus2 size={18} className="mt-0.5 shrink-0 text-sky-300" aria-hidden />
        <span className="flex flex-col">
          <span className="font-medium">{t('newProject.blank')}</span>
          <span className="text-xs text-slate-400">{t('newProject.blankHelp')}</span>
        </span>
      </button>
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          type="button"
          data-testid={`template-${template.id}`}
          aria-pressed={value === template.id}
          className={cardClass(value === template.id)}
          onClick={() => onChange(template.id)}
        >
          {value === template.id ? (
            <Check size={18} className="mt-0.5 shrink-0 text-sky-300" aria-hidden />
          ) : (
            <LayoutTemplate size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
          )}
          <span className="flex flex-col">
            <span className="font-medium">{template.name[lang]}</span>
            <span className="text-xs text-slate-400">{template.description[lang]}</span>
          </span>
        </button>
      ))}
    </div>
  );
};
