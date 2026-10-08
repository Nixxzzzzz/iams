/**
 * User Domain Entity & Locked Roles
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §1, docs/DATABASE_DESIGN.md §3.2
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  ASSET_MANAGER: 'ASSET_MANAGER',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  STAFF: 'STAFF',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export interface User {
  user_id: string; // USR-000001
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: UserRole;
  department_id?: string | null; // DEP-000001
  job_title?: string | null;
  status: UserStatus;
  auth_provider_id?: string | null; // Google OAuth 'sub' claim
  created_at: string;
  updated_at: string;
}
