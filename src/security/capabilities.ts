/**
 * Granular Capability Identifiers (Dot-Notation)
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §2
 */

export const CAPABILITIES = {
  // Assets
  ASSETS_VIEW_ALL: 'assets:view:all',
  ASSETS_VIEW_DEPARTMENT: 'assets:view:department',
  ASSETS_VIEW_ASSIGNED: 'assets:view:assigned',
  ASSETS_CREATE: 'assets:create',
  ASSETS_EDIT: 'assets:edit',
  ASSETS_CHECKOUT: 'assets:checkout',
  ASSETS_CHECKIN: 'assets:checkin',
  ASSETS_ARCHIVE: 'assets:archive',

  // Financial
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_EDIT: 'financial:edit',

  // Taxonomy & Infrastructure
  CATEGORIES_MANAGE: 'categories:manage',
  LOCATIONS_MANAGE: 'locations:manage',
  DEPARTMENTS_MANAGE: 'departments:manage',
  VENDORS_MANAGE: 'vendors:manage',

  // Maintenance
  MAINTENANCE_VIEW_ALL: 'maintenance:view:all',
  MAINTENANCE_VIEW_ASSIGNED: 'maintenance:view:assigned',
  MAINTENANCE_MANAGE: 'maintenance:manage',

  // Requests
  REQUESTS_CREATE: 'requests:create',
  REQUESTS_VIEW_ALL: 'requests:view:all',
  REQUESTS_VIEW_DEPARTMENT: 'requests:view:department',
  REQUESTS_VIEW_OWN: 'requests:view:own',
  REQUESTS_APPROVE_DEPT: 'requests:approve:dept',
  REQUESTS_APPROVE_ASSET: 'requests:approve:asset',

  // Users & Roles
  USERS_VIEW_ALL: 'users:view:all',
  USERS_MANAGE: 'users:manage',

  // Audit & Settings
  AUDIT_VIEW: 'audit:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',

  // Reports
  REPORTS_VIEW_OPERATIONAL: 'reports:view:operational',
  REPORTS_VIEW_FINANCIAL: 'reports:view:financial',
  REPORTS_EXPORT: 'reports:export',
} as const;

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES];
