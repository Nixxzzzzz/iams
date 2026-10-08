import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onDismiss?: () => void;
}

const variantStyles: Record<
  AlertVariant,
  {
    container: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    role: string;
  }
> = {
  info: {
    container:
      'bg-slate-50 border-slate-200 text-slate-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-slate-200',
    icon: Info,
    iconClass: 'text-slate-600 dark:text-slate-400',
    role: 'status',
  },
  success: {
    container:
      'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    role: 'status',
  },
  warning: {
    container:
      'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200',
    icon: AlertTriangle,
    iconClass: 'text-amber-600 dark:text-amber-400',
    role: 'alert',
  },
  danger: {
    container:
      'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-800 dark:text-red-200',
    icon: XCircle,
    iconClass: 'text-red-600 dark:text-red-400',
    role: 'alert',
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, onDismiss, children, ...props }, ref) => {
    const config = variantStyles[variant];
    const IconComponent = config.icon;

    return (
      <div
        ref={ref}
        role={config.role}
        className={cn(
          'relative flex gap-3 p-3.5 rounded-md border text-sm',
          config.container,
          className
        )}
        {...props}
      >
        <div className="shrink-0 mt-0.5">
          <IconComponent className={cn('h-4 w-4', config.iconClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-1">
          {title && <h5 className="font-semibold leading-tight">{title}</h5>}
          {children && <div className="text-xs leading-relaxed opacity-90">{children}</div>}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            className="shrink-0 -mr-1 -mt-1 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';
