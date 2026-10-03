import type { ComponentProps } from 'react';
import { cn } from './cn';
import { FIELD_CLASS } from './input';

export const Textarea = ({ className, ...props }: ComponentProps<'textarea'>) => (
  <textarea className={cn(FIELD_CLASS, 'min-h-24 py-2 leading-relaxed', className)} {...props} />
);
