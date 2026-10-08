import { USER_ROLES, UserRole } from './roles';

/**
 * 3-Tier Data Scoping Resolution
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §3, docs/ARCHITECTURE.md §7.1
 */

export const SCOPE_TYPES = {
  GLOBAL: 'GLOBAL',
  DEPARTMENT: 'DEPARTMENT',
  SELF: 'SELF',
} as const;

export type ScopeType = (typeof SCOPE_TYPES)[keyof typeof SCOPE_TYPES];

export interface ScopedIdentity {
  userId: string;
  role: UserRole;
  departmentId?: string | null;
}

export interface DataScopeFilter {
  scopeType: ScopeType;
  isUnrestricted: boolean;
  departmentId?: string;
  userId?: string;
}

export function resolveDataScope(identity: ScopedIdentity): DataScopeFilter {
  switch (identity.role) {
    case USER_ROLES.SUPER_ADMIN:
    case USER_ROLES.ADMIN:
    case USER_ROLES.ASSET_MANAGER:
    case USER_ROLES.VIEWER:
      return {
        scopeType: SCOPE_TYPES.GLOBAL,
        isUnrestricted: true,
      };

    case USER_ROLES.DEPARTMENT_MANAGER:
      return {
        scopeType: SCOPE_TYPES.DEPARTMENT,
        isUnrestricted: false,
        departmentId: identity.departmentId ?? undefined,
      };

    case USER_ROLES.STAFF:
      return {
        scopeType: SCOPE_TYPES.SELF,
        isUnrestricted: false,
        userId: identity.userId,
      };
  }
}

/**
 * Checks whether an item with specific owner/department attributes is within the user's data scope.
 */
export function isWithinScope(
  identity: ScopedIdentity,
  target: { userId?: string | null; departmentId?: string | null }
): boolean {
  const scope = resolveDataScope(identity);

  if (scope.isUnrestricted) {
    return true;
  }

  if (scope.scopeType === SCOPE_TYPES.DEPARTMENT) {
    if (!scope.departmentId || !target.departmentId) return false;
    return scope.departmentId === target.departmentId;
  }

  if (scope.scopeType === SCOPE_TYPES.SELF) {
    if (!scope.userId || !target.userId) return false;
    return scope.userId === target.userId;
  }

  return false;
}
