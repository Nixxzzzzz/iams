import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-md border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900',
          className
        )}
        {...props}
      >
        {(title || actions) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-gray-800">
            <div>
              {title && (
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h4>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="p-4">{children}</div>
      </div>
    );
  }
);
Panel.displayName = 'Panel';
