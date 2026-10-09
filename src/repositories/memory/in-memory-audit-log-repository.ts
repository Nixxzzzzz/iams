import { AuditLogEntry } from '@/domain/types/audit-log';
import {
  IAuditLogRepository,
  AuditLogFilterCriteria,
  NewAuditLogInput,
} from '@/repositories/interfaces/i-audit-log-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { PAGINATION } from '@/config/constants';

/**
 * In-Memory Append-Only Audit Log Repository Test Double
 * Source of Truth: docs/DATABASE_DESIGN.md §3.13, docs/PROJECT_RULES.md §3
 */

export class InMemoryAuditLogRepository implements IAuditLogRepository {
  private entries: AuditLogEntry[] = [];

  constructor(initial: AuditLogEntry[] = []) {
    this.entries = [...initial];
  }

  clear(): void {
    this.entries = [];
  }

  async findById(auditId: string): Promise<AuditLogEntry | null> {
    const match = this.entries.find((e) => e.audit_id === auditId);
    return match ? { ...match } : null;
  }

  async findMany(filters: AuditLogFilterCriteria = {}): Promise<PaginatedResult<AuditLogEntry>> {
    const filtered = this.entries.filter((e) => {
      if (filters.actor_user_id && e.actor_user_id !== filters.actor_user_id) return false;
      if (filters.action && e.action !== filters.action) return false;
      if (filters.entity_type && e.entity_type !== filters.entity_type) return false;
      if (filters.entity_id && e.entity_id !== filters.entity_id) return false;
      if (filters.startDate && e.timestamp < filters.startDate) return false;
      if (filters.endDate && e.timestamp > filters.endDate) return false;
      return true;
    });

    filtered.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    const total = filtered.length;
    const page = Math.max(1, filters.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(1, filters.limit ?? PAGINATION.DEFAULT_PAGE_SIZE)
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;

    const items = filtered.slice(startIndex, startIndex + limit).map((e) => ({ ...e }));
    return {
      items,
      data: items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async append(input: NewAuditLogInput): Promise<AuditLogEntry> {
    const entry: AuditLogEntry = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    this.entries.push({ ...entry });
    return { ...entry };
  }
}
