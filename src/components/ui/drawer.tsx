'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  className?: string;
}

const widthClasses = {
  md: 'max-w-md md:w-[480px]',
  lg: 'max-w-lg md:w-[540px]',
  xl: 'max-w-xl md:w-[600px]',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg',
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'drawer-title' : undefined}
          className={cn(
            'flex h-full w-screen flex-col bg-white shadow-xl transition-transform border-l border-slate-200 dark:border-gray-800 dark:bg-gray-900',
            widthClasses[width],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-gray-800 shrink-0">
            <div>
              {title && (
                <h3
                  id="drawer-title"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-slate-200 px-5 py-3.5 bg-slate-50 dark:border-gray-800 dark:bg-gray-800/50 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
