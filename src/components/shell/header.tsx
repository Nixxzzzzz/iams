'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Menu } from 'lucide-react';

export interface HeaderProps {
  breadcrumbsSlot?: React.ReactNode;
  searchSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  userSlot?: React.ReactNode;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbsSlot,
  searchSlot,
  actionsSlot,
  userSlot,
  onMobileMenuToggle,
  className,
}) => {
  return (
    <header
      className={cn(
        'flex h-14 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 shrink-0 select-none',
        className
      )}
    >
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Open mobile navigation menu"
            className="md:hidden rounded p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {breadcrumbsSlot && <div className="truncate">{breadcrumbsSlot}</div>}
      </div>

      {/* Center: Search trigger slot */}
      {searchSlot && (
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
          {searchSlot}
        </div>
      )}

      {/* Right: Actions and User profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {actionsSlot}
        {userSlot}
      </div>
    </header>
  );
};
