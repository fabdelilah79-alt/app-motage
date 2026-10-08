import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FORMAT_PRESET_IDS, type FormatPresetId } from '../../shared/formats';
import { LANGS, type Lang } from '../../shared/schema';
import { getTemplate } from '../../shared/templates/registry';
import { api } from '../api/client';
import { openProject } from '../hooks/useHashRoute';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';
import { Field } from '../ui/field';
import { Input } from '../ui/input';
import { NativeSelect } from '../ui/native-select';
import { TemplatePicker } from './TemplatePicker';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** Assistant « Nouveau projet » : point de départ (vide ou modèle), nom, langue, format. */
export const NewProjectDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(() => t('newProject.defaultTitle'));
  const [templateId, setTemplateId] = useState('');
  const [formatId, setFormatId] = useState<FormatPresetId>('landscape');
  const [fps, setFps] = useState<30 | 60>(30);
  const [defaultLang, setDefaultLang] = useState<Lang>('fr');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const template = getTemplate(templateId);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFailed(false);
    try {
      const project = await api.createProject({
        title: title.trim(),
        formatId: template?.formatId ?? formatId,
        defaultLang,
        fps: template ? 30 : fps,
        templateId: template?.id,
      });
      openProject(project.id);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('newProject.title')} wide>
      <form className="flex flex-col gap-4" onSubmit={(event) => void onSubmit(event)}>
        <p className="text-sm text-slate-300">{t('newProject.startFrom')}</p>
        <TemplatePicker value={templateId} onChange={setTemplateId} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t('newProject.name')}>
            <Input data-testid="new-project-title" value={title} required maxLength={120} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Field label={t('newProject.language')} hint={template ? t('newProject.templateLanguage') : undefined}>
            <NativeSelect
              data-testid="new-project-language"
              value={defaultLang}
              onChange={(event) => setDefaultLang(event.target.value as Lang)}
              options={LANGS.map((lang) => ({ value: lang, label: t(`langs.${lang}`) }))}
            />
          </Field>
          {template ? (
            <p className="text-xs text-slate-400 sm:col-span-2">
              {t('newProject.templateFormat', { format: t(`formats.${template.formatId}`) })}
            </p>
          ) : (
            <>
              <Field label={t('newProject.format')}>
                <NativeSelect
                  data-testid="new-project-format"
                  value={formatId}
                  onChange={(event) => setFormatId(event.target.value as FormatPresetId)}
                  options={FORMAT_PRESET_IDS.map((id) => ({ value: id, label: t(`formats.${id}`) }))}
                />
              </Field>
              <Field label={t('newProject.fps')} hint={t('newProject.fpsHelp')}>
                <NativeSelect
                  data-testid="new-project-fps"
                  value={String(fps)}
                  onChange={(event) => setFps(event.target.value === '60' ? 60 : 30)}
                  options={[
                    { value: '30', label: '30' },
                    { value: '60', label: '60' },
                  ]}
                />
              </Field>
            </>
          )}
        </div>
        {failed ? <p className="text-sm text-rose-400">{t('errors.createProject')}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={busy} data-testid="new-project-submit">
            {t('newProject.create')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
