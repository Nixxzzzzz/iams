"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  Wrench,
  Users,
  Building2,
  MapPin,
  Tag,
  Truck,
  BarChart3,
  ScrollText,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/", icon: Boxes },
  { name: "Check-in / Out", href: "/check-in-out", icon: ArrowLeftRight },
  { name: "Requests", href: "/requests", icon: ClipboardList, badge: "3" },
  { name: "Maintenance", href: "/maintenance", icon: Wrench, badge: "1" },
];

const orgNav: NavItem[] = [
  { name: "Users", href: "/users", icon: Users },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Locations", href: "/locations", icon: MapPin },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Vendors", href: "/vendors", icon: Truck },
];

const systemNav: NavItem[] = [
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/audit-logs", icon: ScrollText },
  { name: "Sheets Sync", href: "/sheets-sync", icon: FileSpreadsheet },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors",
                isActive
                  ? "bg-slate-200/80 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-semibold rounded-full",
                    isActive
                      ? "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300"
                      : "bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2.5">
        <div className="w-7 h-7 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-wider">
          AP
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
            Asset Portal
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Enterprise Operations
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {renderNavGroup("Core Operations", mainNav)}
        {renderNavGroup("Organization", orgNav)}
        {renderNavGroup("System & Governance", systemNav)}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Role: Super Admin</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">v1.0.0</span>
      </div>
    </aside>
  );
};
