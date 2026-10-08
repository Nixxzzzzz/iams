import React from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  secondary:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800',
  outline:
    'bg-transparent text-slate-700 border-slate-300 dark:text-slate-300 dark:border-gray-700',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  warning:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  danger:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  info:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-zinc-700',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border tracking-wide select-none',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0 -ml-0.5">{icon}</span>}
        <span>{children}</span>
      </span>
    );
  }
);
Badge.displayName = 'Badge';
