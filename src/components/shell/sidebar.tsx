'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { NavGroup, NavItem } from './types';
import { NavigationGroup } from './navigation-group';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export interface SidebarProps {
  groups: NavGroup[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  brandTitle?: string;
  className?: string;
  onItemClick?: (item: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  isCollapsed = false,
  onToggleCollapse,
  brandTitle = 'Asset Portal',
  className,
  onItemClick,
}) => {
  return (
    <aside
      role="navigation"
      aria-label="Main Navigation"
      className={cn(
        'flex flex-col border-r border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900 transition-all duration-200 ease-in-out shrink-0 select-none',
        isCollapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-3.5 border-b border-slate-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600 text-white shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {brandTitle}
            </span>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {groups.map((group) => (
          <NavigationGroup
            key={group.id}
            group={group}
            isCollapsed={isCollapsed}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* Footer / Collapse Toggle */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-slate-200 dark:border-gray-800 shrink-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors',
              isCollapsed && 'justify-center px-1'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
