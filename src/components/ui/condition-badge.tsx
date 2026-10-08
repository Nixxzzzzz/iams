import React from 'react';
import { cn } from '@/lib/utils/cn';
import { AssetCondition, ASSET_CONDITIONS } from '@/domain/types/asset';
import { Sparkles, ShieldCheck, Check, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface ConditionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  condition: AssetCondition;
  showIcon?: boolean;
}

interface ConditionConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

const CONDITION_CONFIGS: Record<AssetCondition, ConditionConfig> = {
  [ASSET_CONDITIONS.NEW]: {
    label: 'New',
    icon: Sparkles,
    classes:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800',
  },
  [ASSET_CONDITIONS.EXCELLENT]: {
    label: 'Excellent',
    icon: ShieldCheck,
    classes:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  },
  [ASSET_CONDITIONS.GOOD]: {
    label: 'Good',
    icon: Check,
    classes:
      'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800',
  },
  [ASSET_CONDITIONS.FAIR]: {
    label: 'Fair',
    icon: AlertCircle,
    classes:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  },
  [ASSET_CONDITIONS.POOR]: {
    label: 'Poor',
    icon: AlertTriangle,
    classes:
      'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800',
  },
  [ASSET_CONDITIONS.DAMAGED]: {
    label: 'Damaged',
    icon: XCircle,
    classes:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  },
};

export const ConditionBadge = React.forwardRef<HTMLSpanElement, ConditionBadgeProps>(
  ({ className, condition, showIcon = true, ...props }, ref) => {
    const config = CONDITION_CONFIGS[condition] ?? {
      label: condition,
      icon: Check,
      classes: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    const IconComponent = config.icon;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border tracking-wide select-none',
          config.classes,
          className
        )}
        {...props}
      >
        {showIcon && <IconComponent className="h-3.5 w-3.5 shrink-0 -ml-0.5" aria-hidden="true" />}
        <span>{config.label}</span>
      </span>
    );
  }
);
ConditionBadge.displayName = 'ConditionBadge';
