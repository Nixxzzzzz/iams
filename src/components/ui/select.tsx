import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  isError?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, isError = false, disabled, options, placeholder, children, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border bg-white pl-3 pr-8 py-1.5 text-sm text-slate-900 transition-colors cursor-pointer',
            'focus:outline-none focus:ring-1',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-gray-800',
            'dark:bg-gray-900 dark:text-slate-100',
            isError
              ? 'border-red-500 focus:border-red-600 focus:ring-red-600 dark:border-red-500'
              : 'border-slate-300 focus:border-sky-600 focus:ring-sky-600 dark:border-gray-700 dark:focus:border-sky-400 dark:focus:ring-sky-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 h-4 w-4 text-slate-400 dark:text-slate-500"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';
