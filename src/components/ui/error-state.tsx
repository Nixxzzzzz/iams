import React from 'react';
import { cn } from '@/lib/utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'Failed to load data. Please verify your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mb-3">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-slate-300 dark:border-gray-700"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
