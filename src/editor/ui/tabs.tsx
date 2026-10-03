import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentProps } from 'react';
import { cn } from './cn';

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn('flex gap-1 border-b border-slate-800 px-2', className)}
    {...props}
  />
);

export const TabsTrigger = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      '-mb-px border-b-2 border-transparent px-3 py-2 text-sm text-slate-400 hover:text-slate-100',
      'data-[state=active]:border-sky-400 data-[state=active]:text-white',
      className,
    )}
    {...props}
  />
);

export const TabsContent = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn('min-h-0 flex-1 overflow-y-auto p-3', className)}
    {...props}
  />
);
