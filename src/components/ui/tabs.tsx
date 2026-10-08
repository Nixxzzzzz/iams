'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabId,
  onChange,
  className,
  variant = 'underline',
}) => {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentEnabledIdx = enabledTabs.findIndex((t) => t.id === tabs[index].id);

    if (event.key === 'ArrowRight') {
      nextIndex = (currentEnabledIdx + 1) % enabledTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentEnabledIdx - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetTab = enabledTabs[nextIndex];
      onChange(targetTab.id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      const targetBtn = Array.from(buttons || []).find((b) => b.getAttribute('data-tab-id') === targetTab.id);
      targetBtn?.focus();
    }
  };

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className={cn(
        'flex items-center gap-1',
        variant === 'underline' && 'border-b border-slate-200 dark:border-gray-800',
        className
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTabId;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            data-tab-id={tab.id}
            id={`tab-${tab.id}`}
            aria-controls={`panel-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'inline-flex items-center gap-2 text-xs font-semibold select-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              variant === 'underline' && [
                'py-2.5 px-3 -mb-px border-b-2',
                isActive
                  ? 'border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200',
              ],
              variant === 'pills' && [
                'px-3 py-1.5 rounded-md',
                isActive
                  ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-gray-800',
              ]
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
                  isActive
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface TabPanelProps {
  id: string;
  activeTabId: string;
  children?: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, activeTabId, children, className }) => {
  if (id !== activeTabId) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={cn('focus-visible:outline-none pt-4', className)}
    >
      {children}
    </div>
  );
};
