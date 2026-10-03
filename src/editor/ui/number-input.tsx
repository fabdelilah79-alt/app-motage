import { useState, type ComponentProps } from 'react';
import { Input } from './input';

type Props = Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'> & {
  value: number;
  onValueChange: (value: number) => void;
};

/**
 * Champ numérique : la saisie en cours est conservée telle quelle (ex. champ vide),
 * seules les valeurs valides sont transmises.
 */
export const NumberInput = ({ value, onValueChange, onBlur, ...props }: Props) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <Input
      type="number"
      inputMode="decimal"
      dir="ltr"
      value={draft ?? String(value)}
      onChange={(event) => {
        const text = event.target.value;
        setDraft(text);
        const parsed = Number(text);
        if (text.trim() !== '' && Number.isFinite(parsed)) onValueChange(parsed);
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
      {...props}
    />
  );
};
