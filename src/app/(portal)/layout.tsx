import React from 'react';
import { Package, Shield, Settings, FileText, Wrench, Users, BarChart3, LayoutDashboard } from 'lucide-react';
import { siteConfig } from '@/config/site';

/**
 * Structural Portal Shell Layout Placeholder
 * Source of Truth: docs/UI_UX_GUIDELINES.md §3, docs/ARCHITECTURE.md §8.3
 *
 * Provides persistent 240px sidebar, 56px top header, and main content canvas.
 */

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Structural Desktop Sidebar Placeholder (240px) */}
      <aside className="w-full md:w-60 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div>
          {/* Header & Brand */}
          <div className="h-14 flex items-center px-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-sky-600 text-white flex items-center justify-center font-semibold text-xs">
                AP
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                {siteConfig.name}
              </span>
            </div>
          </div>

          {/* Navigation Placeholders */}
          <nav className="p-3 space-y-1 text-sm text-slate-600">
            <div className="px-3 py-1.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Core Operations
            </div>
            <a
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 rounded-md font-medium text-sky-700 bg-sky-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <Package className="w-4 h-4" />
              <span>Assets</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <FileText className="w-4 h-4" />
              <span>Assignments</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <Wrench className="w-4 h-4" />
              <span>Maintenance</span>
            </div>

            <div className="pt-3 px-3 py-1.5 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Administration
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <Shield className="w-4 h-4" />
              <span>Audit Logs</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-slate-500 hover:bg-slate-50">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-200 text-xs text-slate-400">
          <span>Version {siteConfig.version}</span>
          <div className="text-[11px] text-slate-400">Stage 1 Architecture Shell</div>
        </div>
      </aside>

      {/* Main Structural Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header (56px) */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <span className="text-slate-900 font-medium">Portal</span>
            <span>/</span>
            <span>Architecture Baseline</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
              Stage 1 Baseline
            </span>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
