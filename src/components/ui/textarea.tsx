import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError = false, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        className={cn(
          'flex w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 transition-colors',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-1',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-gray-800',
          'dark:bg-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500',
          isError
            ? 'border-red-500 focus:border-red-600 focus:ring-red-600 dark:border-red-500'
            : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600 dark:border-gray-700 dark:focus:border-sky-400 dark:focus:ring-sky-400',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
