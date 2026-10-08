import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent = Inbox,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-gray-800 dark:text-slate-400 mb-3">
        <IconComponent className="h-6 w-6" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
