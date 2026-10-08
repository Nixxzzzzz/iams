import React from 'react';
import {
  LayoutDashboard,
  Package,
  FileText,
  GitPullRequest,
  Wrench,
  Users,
  Building2,
  MapPin,
  Handshake,
  BarChart3,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/config/site';
import { getServerSession } from '@/security/server-session';
import { getVisibleNavigationForRole } from '@/security/navigation';
import { logoutAction } from '@/security/actions';
import { USER_ROLES } from '@/security/roles';
import { NavGroup } from '@/components/shell/types';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  GitPullRequest: <GitPullRequest className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  MapPin: <MapPin className="h-4 w-4" />,
  Handshake: <Handshake className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getServerSession();
  const effectiveRole = session?.role ?? USER_ROLES.VIEWER;

  // Resolve role-aware navigation foundation: Role -> Capabilities -> Nav Items
  const rawNavGroups = getVisibleNavigationForRole(effectiveRole);

  const navGroups: NavGroup[] = rawNavGroups.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: ICONS_MAP[item.iconName] ?? <Package className="h-4 w-4" />,
      isActive: item.href === '/dashboard',
    })),
  }));

  const userInitials = session?.name
    ? session.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <AppShell
      navGroups={navGroups}
      brandTitle={siteConfig.name}
      headerBreadcrumbs={
        <Breadcrumbs
          items={[
            { label: 'Portal' },
            { label: 'Dashboard' },
          ]}
        />
      }
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[11px] hidden sm:inline-flex">
            {effectiveRole}
          </Badge>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out"
              aria-label="Sign out of portal session"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/40 rounded border border-slate-200 dark:border-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </form>
        </div>
      }
      headerUser={
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-gray-800 text-xs">
          <div className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 flex items-center justify-center font-bold text-[11px]">
            {userInitials}
          </div>
          <div className="hidden lg:flex flex-col text-left leading-tight">
            <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
              {session?.name ?? 'Authenticated User'}
            </span>
            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
              {session?.email ?? 'Session Verified'}
            </span>
          </div>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
