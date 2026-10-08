import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface FieldsetProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string;
  description?: string;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  className,
  legend,
  description,
  children,
  ...props
}) => {
  return (
    <fieldset
      className={cn('space-y-4 rounded-lg border border-slate-200 p-4 dark:border-gray-800', className)}
      {...props}
    >
      {(legend || description) && (
        <div className="border-b border-slate-100 pb-2 dark:border-slate-800">
          {legend && (
            <legend className="text-sm font-semibold text-slate-900 dark:text-slate-100 px-1">
              {legend}
            </legend>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-1 mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
};
