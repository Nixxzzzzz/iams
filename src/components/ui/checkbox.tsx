import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, checked, disabled, label, description, id, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (internalRef.current) {
        internalRef.current.indeterminate = Boolean(indeterminate);
      }
    }, [indeterminate]);

    const setRefs = (element: HTMLInputElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
      }
    };

    const inputControl = (
      <input
        ref={setRefs}
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        className={cn(
          'h-4 w-4 rounded border-slate-300 text-sky-600 transition-colors',
          'focus:ring-2 focus:ring-sky-600 focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-700 dark:bg-gray-900 dark:checked:bg-sky-500',
          className
        )}
        {...props}
      />
    );

    if (!label) {
      return inputControl;
    }

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-start gap-2.5 select-none cursor-pointer text-sm',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className="pt-0.5">{inputControl}</span>
        <span className="flex flex-col">
          <span className="font-medium text-slate-900 dark:text-slate-100">{label}</span>
          {description && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
          )}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
