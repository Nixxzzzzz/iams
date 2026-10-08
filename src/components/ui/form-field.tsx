import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Label } from './label';

export interface FormFieldProps {
  id?: string;
  label?: string;
  isRequired?: boolean;
  description?: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  isRequired = false,
  description,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <Label htmlFor={id} isRequired={isRequired}>
          {label}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
          {description}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="text-xs font-medium text-red-600 dark:text-red-400 leading-tight"
        >
          {error}
        </p>
      )}
    </div>
  );
};
