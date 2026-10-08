'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  FileText,
  Wrench,
  Users,
  Building2,
  MapPin,
  Handshake,
  BarChart3,
  Shield,
  Settings,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const navGroups = [
  {
    id: 'operations',
    label: 'Core Operations',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
        isActive: true,
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '#',
        icon: <Package className="h-4 w-4" />,
      },
      {
        id: 'assignments',
        label: 'Assignments',
        href: '#',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        href: '#',
        icon: <Wrench className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    items: [
      {
        id: 'users',
        label: 'Users',
        href: '#',
        icon: <Users className="h-4 w-4" />,
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '#',
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        id: 'locations',
        label: 'Locations',
        href: '#',
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        id: 'vendors',
        label: 'Vendors',
        href: '#',
        icon: <Handshake className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'records',
    label: 'Records & Compliance',
    items: [
      {
        id: 'reports',
        label: 'Reports',
        href: '#',
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '#',
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '#',
        icon: <Settings className="h-4 w-4" />,
      },
    ],
  },
];

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <AppShell
      navGroups={navGroups}
      brandTitle={siteConfig.name}
      headerBreadcrumbs={
        <Breadcrumbs
          items={[
            { label: 'Portal' },
            { label: 'Design System Foundation' },
          ]}
        />
      }
      headerActions={
        <Badge variant="secondary" className="font-mono text-[11px]">
          Stage 2 Active
        </Badge>
      }
      headerUser={
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800 text-xs">
          <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-gray-800 flex items-center justify-center font-semibold text-[10px] text-slate-700 dark:text-slate-300">
            UI
          </div>
          <span className="font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
            Design System
          </span>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
