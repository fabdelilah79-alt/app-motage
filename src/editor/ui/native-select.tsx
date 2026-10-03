import type { ComponentProps } from 'react';
import { cn } from './cn';
import { FIELD_CLASS } from './input';

export type SelectOption = { value: string; label: string };

type NativeSelectProps = Omit<ComponentProps<'select'>, 'children'> & {
  options: readonly SelectOption[];
};

/** Liste déroulante du navigateur (accessible, fonctionne en RTL). */
export const NativeSelect = ({ options, className, ...props }: NativeSelectProps) => (
  <select className={cn(FIELD_CLASS, 'h-9', className)} {...props}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
