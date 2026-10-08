import { useTranslation } from 'react-i18next';
import { parseExpression } from '../../../shared/science/expression';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';

type Props = { label: string; value: string; onChange: (value: string) => void; testId?: string };

/** Expression mathématique (ex. « a*x^2 », « A*sin(omega*t) ») avec message d'erreur clair. */
export const ExpressionInput = ({ label, value, onChange, testId }: Props) => {
  const { t } = useTranslation();
  const parsed = parseExpression(value);
  return (
    <Field label={label} hint={parsed.ok ? undefined : t('science.expressionError', { message: parsed.error })}>
      <Input
        dir="ltr"
        className="font-mono"
        data-testid={testId}
        aria-invalid={!parsed.ok}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
};
