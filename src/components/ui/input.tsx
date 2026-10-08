import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', isError = false, disabled, prefixElement, suffixElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixElement && (
          <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            {prefixElement}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full rounded-md border bg-white px-3 py-1.5 text-sm text-slate-900 transition-colors',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-1',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-gray-800',
            'dark:bg-gray-900 dark:text-slate-100 dark:placeholder:text-slate-500',
            isError
              ? 'border-red-500 focus:border-red-600 focus:ring-red-600 dark:border-red-500'
              : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600 dark:border-gray-700 dark:focus:border-sky-400 dark:focus:ring-sky-400',
            prefixElement && 'pl-9',
            suffixElement && 'pr-9',
            className
          )}
          {...props}
        />
        {suffixElement && (
          <div className="absolute right-3 flex items-center pointer-events-none text-slate-400">
            {suffixElement}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
