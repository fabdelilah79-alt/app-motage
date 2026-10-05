import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from './cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  /** Empêche la fermeture (ex. pendant un export). */
  locked?: boolean;
  /** Fenêtre large (grilles de vignettes). */
  wide?: boolean;
};

export const Dialog = ({
  open,
  onOpenChange,
  title,
  children,
  locked = false,
  wide = false,
}: DialogProps) => {
  const { t } = useTranslation();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !locked && onOpenChange(next)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl',
            wide ? 'w-[min(94vw,52rem)]' : 'w-[min(92vw,30rem)]',
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <DialogPrimitive.Title className="text-lg font-semibold">{title}</DialogPrimitive.Title>
            {locked ? null : (
              <DialogPrimitive.Close
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                aria-label={t('common.close')}
              >
                <X size={18} />
              </DialogPrimitive.Close>
            )}
          </div>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
