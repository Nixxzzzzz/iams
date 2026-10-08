import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbsSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbsSlot,
  actionsSlot,
  className,
}) => {
  return (
    <div className={cn('space-y-2 pb-4', className)}>
      {breadcrumbsSlot && <div className="mb-1">{breadcrumbsSlot}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-7">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
        {actionsSlot && (
          <div className="flex items-center gap-2 shrink-0">{actionsSlot}</div>
        )}
      </div>
    </div>
  );
};
