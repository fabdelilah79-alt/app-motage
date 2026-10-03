import type { ComponentProps } from 'react';
import { cn } from './cn';

const VARIANTS = {
  primary: 'bg-sky-500 text-white hover:bg-sky-400',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
} as const;

const SIZES = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3.5 text-sm',
  icon: 'h-8 w-8 p-0',
} as const;

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export const Button = ({
  variant = 'secondary',
  size = 'md',
  type = 'button',
  className,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium transition-colors',
      'focus-visible:outline-2 focus-visible:outline-sky-400 disabled:pointer-events-none disabled:opacity-40',
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...props}
  />
);
