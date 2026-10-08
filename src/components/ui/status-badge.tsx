import React from 'react';
import { cn } from '@/lib/utils/cn';
import { AssetStatus, ASSET_STATUSES } from '@/domain/types/asset';
import {
  CheckCircle2,
  User,
  Clock,
  Wrench,
  AlertTriangle,
  XCircle,
  Archive,
  Trash2,
  DollarSign,
  HeartHandshake,
  PackagePlus,
  Bookmark,
  Activity,
  RotateCcw,
  Search,
} from 'lucide-react';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AssetStatus;
  showIcon?: boolean;
}

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}

const STATUS_CONFIGS: Record<AssetStatus, StatusConfig> = {
  [ASSET_STATUSES.ACQUIRED]: {
    label: 'Acquired',
    icon: PackagePlus,
    classes:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  },
  [ASSET_STATUSES.AVAILABLE]: {
    label: 'Available',
    icon: CheckCircle2,
    classes:
      'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800',
  },
  [ASSET_STATUSES.RESERVED]: {
    label: 'Reserved',
    icon: Bookmark,
    classes:
      'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800',
  },
  [ASSET_STATUSES.ASSIGNED]: {
    label: 'Assigned',
    icon: User,
    classes:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800',
  },
  [ASSET_STATUSES.CHECKED_OUT]: {
    label: 'Checked Out',
    icon: Clock,
    classes:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  },
  [ASSET_STATUSES.IN_USE]: {
    label: 'In Use',
    icon: Activity,
    classes:
      'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800',
  },
  [ASSET_STATUSES.RETURNED]: {
    label: 'Returned',
    icon: RotateCcw,
    classes:
      'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  },
  [ASSET_STATUSES.INSPECTION]: {
    label: 'Inspection',
    icon: Search,
    classes:
      'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800',
  },
  [ASSET_STATUSES.IN_MAINTENANCE]: {
    label: 'In Maintenance',
    icon: Wrench,
    classes:
      'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800',
  },
  [ASSET_STATUSES.DAMAGED]: {
    label: 'Damaged',
    icon: AlertTriangle,
    classes:
      'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  },
  [ASSET_STATUSES.LOST]: {
    label: 'Lost',
    icon: XCircle,
    classes:
      'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800',
  },
  [ASSET_STATUSES.PENDING_RETIREMENT]: {
    label: 'Pending Retirement',
    icon: Clock,
    classes:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800',
  },
  [ASSET_STATUSES.RETIRED]: {
    label: 'Retired',
    icon: Archive,
    classes:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700',
  },
  [ASSET_STATUSES.DISPOSED]: {
    label: 'Disposed',
    icon: Trash2,
    classes:
      'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700',
  },
  [ASSET_STATUSES.SOLD]: {
    label: 'Sold',
    icon: DollarSign,
    classes:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700',
  },
  [ASSET_STATUSES.DONATED]: {
    label: 'Donated',
    icon: HeartHandshake,
    classes:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700',
  },
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, showIcon = true, ...props }, ref) => {
    const config = STATUS_CONFIGS[status] ?? {
      label: status,
      icon: Activity,
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
StatusBadge.displayName = 'StatusBadge';
