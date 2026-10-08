import React from 'react';
import { cn } from '@/lib/utils/cn';
import { DossierHeaderData } from './types';
import { StatusBadge } from '../ui/status-badge';
import { ConditionBadge } from '../ui/condition-badge';
import { Tag, Hash, Laptop } from 'lucide-react';

export interface AssetDossierHeaderProps {
  data: DossierHeaderData;
  actions?: React.ReactNode;
  className?: string;
}

export const AssetDossierHeader: React.FC<AssetDossierHeaderProps> = ({
  data,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left Column: Identifiers */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-sky-700 bg-sky-50 dark:bg-sky-950/70 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              <Tag className="h-3 w-3" />
              {data.assetTag}
            </span>

            <StatusBadge status={data.status} />
            <ConditionBadge condition={data.condition} />

            {data.categoryName && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Laptop className="h-3 w-3" />
                {data.categoryName}
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {data.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {(data.brand || data.model) && (
              <span>
                {[data.brand, data.model].filter(Boolean).join(' ')}
              </span>
            )}
            {data.serialNumber && (
              <span className="flex items-center gap-1 font-mono">
                <Hash className="h-3 w-3" />
                {data.serialNumber}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Actions Slot */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-start">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
