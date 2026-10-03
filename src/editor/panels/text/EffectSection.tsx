import type { ReactNode } from 'react';

type Props = {
  label: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: ReactNode;
  testId?: string;
};

/** Un effet activable : case à cocher, puis ses réglages quand il est actif. */
export const EffectSection = ({ label, enabled, onToggle, children, testId }: Props) => (
  <div className="rounded-md border border-slate-800 p-2">
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        data-testid={testId}
        checked={enabled}
        onChange={(event) => onToggle(event.target.checked)}
        className="h-4 w-4 accent-sky-500"
      />
      {label}
    </label>
    {enabled ? <div className="mt-2 grid grid-cols-2 gap-2">{children}</div> : null}
  </div>
);
