import { AuditLogEntry, AuditAction } from '@/domain/types/audit-log';
import { PaginationParams, PaginatedResult } from './common';

/**
 * Append-Only Administrative Audit Log Repository Interface
 * Source of Truth: docs/DATABASE_DESIGN.md §3.13, docs/PROJECT_RULES.md §3
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * Audit Logs is an append-only immutable security ledger.
 * This interface intentionally exposes NO update and NO delete methods.
 */

export interface AuditLogFilterCriteria extends PaginationParams {
  actor_user_id?: string;
  action?: AuditAction;
  entity_type?: string;
  entity_id?: string;
  startDate?: string;
  endDate?: string;
}

export type NewAuditLogInput = Omit<AuditLogEntry, 'timestamp'>;

export interface IAuditLogRepository {
  findById(auditId: string): Promise<AuditLogEntry | null>;
  findMany(filters?: AuditLogFilterCriteria): Promise<PaginatedResult<AuditLogEntry>>;
  /**
   * Appends an immutable security record to the audit log.
   */
  append(entry: NewAuditLogInput): Promise<AuditLogEntry>;
}
