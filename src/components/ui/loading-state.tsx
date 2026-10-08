import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LoadingStateProps {
  rows?: number;
  type?: 'table' | 'card' | 'spinner';
  message?: string;
  className?: string;
}

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-slate-200 dark:bg-gray-800',
        className
      )}
      {...props}
    />
  );
};

export const LoadingState: React.FC<LoadingStateProps> = ({
  rows = 5,
  type = 'table',
  message = 'Loading...',
  className,
}) => {
  if (type === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center p-8 gap-3', className)}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 dark:border-gray-700 dark:border-t-sky-400" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {message}
        </span>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={cn('space-y-3 p-4 rounded-md border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900', className)}>
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('w-full space-y-2 p-4', className)}
    >
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
};
