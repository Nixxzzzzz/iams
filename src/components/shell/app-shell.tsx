'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { NavGroup, NavItem } from './types';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { MainContent } from './main-content';
import { X } from 'lucide-react';

export interface AppShellProps {
  navGroups: NavGroup[];
  headerBreadcrumbs?: React.ReactNode;
  headerSearch?: React.ReactNode;
  headerActions?: React.ReactNode;
  headerUser?: React.ReactNode;
  brandTitle?: string;
  children: React.ReactNode;
  className?: string;
  onNavItemClick?: (item: NavItem) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  navGroups,
  headerBreadcrumbs,
  headerSearch,
  headerActions,
  headerUser,
  brandTitle = 'Asset Portal',
  children,
  className,
  onNavItemClick,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50',
        className
      )}
    >
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar
          groups={navGroups}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          brandTitle={brandTitle}
          onItemClick={onNavItemClick}
        />
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="presentation">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-64 max-w-[80vw] flex-col bg-white dark:bg-gray-900 h-full shadow-xl">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation"
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Sidebar
              groups={navGroups}
              isCollapsed={false}
              brandTitle={brandTitle}
              onItemClick={(item) => {
                setIsMobileMenuOpen(false);
                onNavItemClick?.(item);
              }}
              className="border-r-0 h-full"
            />
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header
          breadcrumbsSlot={headerBreadcrumbs}
          searchSlot={headerSearch}
          actionsSlot={headerActions}
          userSlot={headerUser}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};
