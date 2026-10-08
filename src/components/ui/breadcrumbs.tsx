import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs', className)}>
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3 w-3 text-slate-400 dark:text-slate-600 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : item.onClick || item.href ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:underline truncate max-w-[150px]"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
