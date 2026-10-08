import { UserRole, USER_ROLES } from './roles';
import { CAPABILITIES, Capability } from './capabilities';
import { hasCapability } from './permissions';

/**
 * Role-Aware Navigation Foundation
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §4, docs/UI_UX_GUIDELINES.md §3
 *
 * Chain of Authority:
 * Role -> Capabilities -> Navigation Visibility
 *
 * Client-side navigation visibility is purely for UX convenience.
 * Server-side authorization remains authoritative.
 */

export interface NavigationItemDefinition {
  id: string;
  label: string;
  href: string;
  iconName: string;
  requiredCapabilities?: readonly Capability[];
  requireAllCapabilities?: boolean;
}

export interface NavigationGroupDefinition {
  id: string;
  label: string;
  items: NavigationItemDefinition[];
}

export const NAVIGATION_STRUCTURE: readonly NavigationGroupDefinition[] = [
  {
    id: 'operations',
    label: 'Core Operations',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        iconName: 'LayoutDashboard',
      },
      {
        id: 'assets',
        label: 'Assets',
        href: '/assets',
        iconName: 'Package',
        requiredCapabilities: [
          CAPABILITIES.ASSETS_VIEW_ALL,
          CAPABILITIES.ASSETS_VIEW_DEPARTMENT,
          CAPABILITIES.ASSETS_VIEW_ASSIGNED,
        ],
        requireAllCapabilities: false,
      },
      {
        id: 'assignments',
        label: 'Assignments',
        href: '/assignments',
        iconName: 'FileText',
        requiredCapabilities: [
          CAPABILITIES.ASSETS_CHECKOUT,
          CAPABILITIES.ASSETS_CHECKIN,
          CAPABILITIES.ASSETS_VIEW_DEPARTMENT,
        ],
        requireAllCapabilities: false,
      },
      {
        id: 'requests',
        label: 'Requests',
        href: '/requests',
        iconName: 'GitPullRequest',
        requiredCapabilities: [
          CAPABILITIES.REQUESTS_CREATE,
          CAPABILITIES.REQUESTS_VIEW_ALL,
          CAPABILITIES.REQUESTS_VIEW_DEPARTMENT,
          CAPABILITIES.REQUESTS_VIEW_OWN,
        ],
        requireAllCapabilities: false,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        href: '/maintenance',
        iconName: 'Wrench',
        requiredCapabilities: [
          CAPABILITIES.MAINTENANCE_VIEW_ALL,
          CAPABILITIES.MAINTENANCE_VIEW_ASSIGNED,
        ],
        requireAllCapabilities: false,
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
        href: '/users',
        iconName: 'Users',
        requiredCapabilities: [CAPABILITIES.USERS_VIEW_ALL],
      },
      {
        id: 'departments',
        label: 'Departments',
        href: '/departments',
        iconName: 'Building2',
        requiredCapabilities: [CAPABILITIES.DEPARTMENTS_MANAGE],
      },
      {
        id: 'locations',
        label: 'Locations',
        href: '/locations',
        iconName: 'MapPin',
        requiredCapabilities: [CAPABILITIES.LOCATIONS_MANAGE],
      },
      {
        id: 'vendors',
        label: 'Vendors',
        href: '/vendors',
        iconName: 'Handshake',
        requiredCapabilities: [CAPABILITIES.VENDORS_MANAGE],
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
        href: '/reports',
        iconName: 'BarChart3',
        requiredCapabilities: [
          CAPABILITIES.REPORTS_VIEW_OPERATIONAL,
          CAPABILITIES.REPORTS_VIEW_FINANCIAL,
        ],
        requireAllCapabilities: false,
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '/audit-logs',
        iconName: 'Shield',
        requiredCapabilities: [CAPABILITIES.AUDIT_VIEW],
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/settings',
        iconName: 'Settings',
        requiredCapabilities: [
          CAPABILITIES.SETTINGS_VIEW,
          CAPABILITIES.SETTINGS_MANAGE,
        ],
        requireAllCapabilities: false,
      },
    ],
  },
] as const;

export function isItemVisibleForRole(
  item: NavigationItemDefinition,
  role: UserRole
): boolean {
  if (!item.requiredCapabilities || item.requiredCapabilities.length === 0) {
    return true;
  }

  if (item.requireAllCapabilities) {
    return item.requiredCapabilities.every((cap) => hasCapability(role, cap));
  }

  return item.requiredCapabilities.some((cap) => hasCapability(role, cap));
}

export function getVisibleNavigationForRole(
  role: UserRole
): NavigationGroupDefinition[] {
  return NAVIGATION_STRUCTURE.map((group) => ({
    ...group,
    items: group.items.filter((item) => isItemVisibleForRole(item, role)),
  })).filter((group) => group.items.length > 0);
}

export function isRouteAccessibleForRole(
  pathname: string,
  role: UserRole
): boolean {
  // Public routes always accessible
  if (pathname === '/login' || pathname === '/api/health') {
    return true;
  }

  // Dashboard accessible to all valid roles
  if (pathname === '/dashboard' || pathname === '/') {
    return true;
  }

  // Find matching navigation item by route prefix
  for (const group of NAVIGATION_STRUCTURE) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return isItemVisibleForRole(item, role);
      }
    }
  }

  // Fail-closed for unknown routes unless super admin
  return role === USER_ROLES.SUPER_ADMIN;
}
