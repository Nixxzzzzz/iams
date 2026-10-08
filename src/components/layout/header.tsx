"use client";

import React from "react";
import { Search, QrCode, Bell, User as UserIcon } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 max-w-md w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search inventory by Asset Tag, Serial, or Name (Press / to focus)..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        >
          <QrCode className="w-3.5 h-3.5 text-slate-500" />
          <span>Scan QR</span>
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

        <button
          type="button"
          className="relative p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-none">
              Admin User
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              IT Operations
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
