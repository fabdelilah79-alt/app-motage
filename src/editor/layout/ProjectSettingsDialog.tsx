import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store/editorStore';
import { useProject } from '../store/selectors';
import { Dialog } from '../ui/dialog';
import { Field } from '../ui/field';
import { NativeSelect } from '../ui/native-select';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

/** Réglages du projet : chiffres latins (0-9) ou arabes orientaux (٠-٩) dans les textes arabes. */
export const ProjectSettingsDialog = ({ open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const project = useProject();
  const setDigits = useEditorStore((state) => state.setDigits);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('projectSettings.title')}>
      <Field label={t('projectSettings.digits')} hint={t('projectSettings.digitsHelp')}>
        <NativeSelect
          data-testid="project-digits"
          value={project.digits}
          options={[
            { value: 'latin', label: t('projectSettings.digitsLatin') },
            { value: 'arabic-indic', label: t('projectSettings.digitsArabic') },
          ]}
          onChange={(event) =>
            setDigits(event.target.value === 'arabic-indic' ? 'arabic-indic' : 'latin')
          }
        />
      </Field>
    </Dialog>
  );
};
