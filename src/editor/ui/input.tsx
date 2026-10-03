import type { ComponentProps } from 'react';
import { cn } from './cn';

export const FIELD_CLASS =
  'w-full rounded-md border border-slate-700 bg-slate-900 px-2.5 text-sm text-slate-100 ' +
  'focus:border-sky-400 focus:outline-none disabled:opacity-50';

export const Input = ({ className, ...props }: ComponentProps<'input'>) => (
  <input className={cn(FIELD_CLASS, 'h-9', className)} {...props} />
);
