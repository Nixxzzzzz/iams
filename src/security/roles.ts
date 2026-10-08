import { USER_ROLES, UserRole } from '@/domain/types/user';

/**
 * Locked Role Definitions
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §1
 */

export { USER_ROLES, type UserRole };

export const ALL_ROLES: readonly UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.ASSET_MANAGER,
  USER_ROLES.DEPARTMENT_MANAGER,
  USER_ROLES.STAFF,
  USER_ROLES.VIEWER,
] as const;

export function isValidRole(role: string): role is UserRole {
  return ALL_ROLES.includes(role as UserRole);
}
