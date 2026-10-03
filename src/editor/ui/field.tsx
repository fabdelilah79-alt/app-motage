import type { ReactNode } from 'react';

type FieldProps = { label: string; children: ReactNode; hint?: string };

/** Étiquette + contrôle, empilés verticalement. */
export const Field = ({ label, children, hint }: FieldProps) => (
  <label className="flex flex-col gap-1 text-xs text-slate-400">
    <span>{label}</span>
    {children}
    {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
  </label>
);
