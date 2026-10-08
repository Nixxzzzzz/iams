/**
 * Immutable Administrative & Security Audit Log Entry
 * Source of Truth: docs/DATABASE_DESIGN.md §3.13, docs/PROJECT_RULES.md §3
 *
 * Appended upon every security event, configuration modification, and administrative action.
 * IMMUTABLE: No update or delete operations are permitted.
 */

export const AUDIT_ACTIONS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  ROLE_MODIFIED: 'ROLE_MODIFIED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  CONFIG_MODIFIED: 'CONFIG_MODIFIED',
  ASSET_CREATED: 'ASSET_CREATED',
  ASSET_UPDATED: 'ASSET_UPDATED',
  ASSET_DECOMMISSIONED: 'ASSET_DECOMMISSIONED',
  OVERRIDE_EXECUTED: 'OVERRIDE_EXECUTED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface AuditLogEntry {
  audit_id: string; // AUD-000001
  timestamp: string; // ISO-8601
  actor_user_id: string; // USR-000001 or 'SYSTEM'
  action: AuditAction;
  entity_type: string; // Asset, User, Setting, Assignment
  entity_id?: string | null;
  before_state?: string | null; // Serialized before state
  after_state?: string | null; // Serialized after state
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
}
