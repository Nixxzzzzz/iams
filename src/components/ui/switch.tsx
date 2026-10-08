import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, label, description, id, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const switchButton = (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-sky-600 dark:bg-sky-500' : 'bg-slate-200 dark:bg-gray-700',
          className
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-150 ease-in-out',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    );

    if (!label) {
      return switchButton;
    }

    return (
      <label
        htmlFor={id}
        className={cn(
          'inline-flex items-start gap-3 select-none cursor-pointer text-sm',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className="pt-0.5">{switchButton}</span>
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
Switch.displayName = 'Switch';
