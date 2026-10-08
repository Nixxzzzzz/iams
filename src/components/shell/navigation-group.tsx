'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { NavGroup, NavItem } from './types';

export interface NavigationGroupProps {
  group: NavGroup;
  isCollapsed?: boolean;
  className?: string;
  onItemClick?: (item: NavItem) => void;
}

export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  group,
  isCollapsed = false,
  className,
  onItemClick,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      {!isCollapsed && group.label && (
        <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {group.label}
        </div>
      )}

      <ul className="space-y-0.5 list-none p-0 m-0">
        {group.items.map((item) => {
          const content = (
            <span
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-colors select-none',
                isCollapsed ? 'justify-center px-2' : '',
                item.isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold dark:bg-sky-950 dark:text-sky-300'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-zinc-800 dark:hover:text-slate-100',
                item.disabled && 'opacity-40 pointer-events-none'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon && (
                <span
                  className={cn(
                    'shrink-0',
                    item.isActive
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {item.icon}
                </span>
              )}
              {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                    item.isActive
                      ? 'bg-sky-200/60 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                      : 'bg-slate-200 text-slate-700 dark:bg-gray-800 dark:text-slate-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </span>
          );

          return (
            <li key={item.id}>
              {item.disabled ? (
                content
              ) : (
                <Link
                  href={item.href}
                  onClick={() => onItemClick && onItemClick(item)}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 rounded-md"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
