import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, isRequired = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'text-xs font-semibold text-slate-700 dark:text-slate-300 select-none block',
          className
        )}
        {...props}
      >
        {children}
        {isRequired && (
          <span className="text-red-600 dark:text-red-400 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);
Label.displayName = 'Label';
