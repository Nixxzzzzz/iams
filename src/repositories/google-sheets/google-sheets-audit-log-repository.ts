import { AuditLogEntry, AuditAction } from '@/domain/types/audit-log';
import {
  IAuditLogRepository,
  AuditLogFilterCriteria,
  NewAuditLogInput,
} from '@/repositories/interfaces/i-audit-log-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { GoogleSheetsClient } from '@/lib/google-sheets/sheets-client';
import { SheetCellValue } from '@/lib/google-sheets/asset-row-mapper';
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '@/lib/utils/sanitize';
import { Mutex } from '@/lib/utils/mutex';
import { PAGINATION } from '@/config/constants';

/**
 * Google Sheets Append-Only Audit Log Repository Adapter
 * Source of Truth: docs/DATABASE_DESIGN.md §3.13, docs/PROJECT_RULES.md §3
 *
 * Immutability Contract:
 * Appends rows only. No updates or deletions are exposed or supported.
 */

export class GoogleSheetsAuditLogRepository implements IAuditLogRepository {
  private client: GoogleSheetsClient;
  private writeMutex = new Mutex();

  constructor(client: GoogleSheetsClient) {
    this.client = client;
  }

  private mapRowToAuditLog(row: SheetCellValue[]): AuditLogEntry {
    const getStr = (index: number): string | null => {
      const raw = row[index];
      if (raw === undefined || raw === null || raw === '') return null;
      return desanitizeFromSpreadsheet(String(raw).trim());
    };

    return {
      audit_id: getStr(0) ?? '',
      timestamp: getStr(1) ?? new Date().toISOString(),
      actor_user_id: getStr(2) ?? '',
      action: (getStr(3) ?? 'ASSET_CREATED') as AuditAction,
      entity_type: getStr(4) ?? '',
      entity_id: getStr(5),
      before_state: getStr(6),
      after_state: getStr(7),
      ip_address: getStr(8),
      user_agent: getStr(9),
      session_id: getStr(10),
    };
  }

  private mapAuditLogToRow(entry: AuditLogEntry): SheetCellValue[] {
    return [
      sanitizeForSpreadsheet(entry.audit_id),
      entry.timestamp,
      sanitizeForSpreadsheet(entry.actor_user_id),
      entry.action,
      sanitizeForSpreadsheet(entry.entity_type),
      entry.entity_id ? sanitizeForSpreadsheet(entry.entity_id) : '',
      entry.before_state ? sanitizeForSpreadsheet(entry.before_state) : '',
      entry.after_state ? sanitizeForSpreadsheet(entry.after_state) : '',
      entry.ip_address ? sanitizeForSpreadsheet(entry.ip_address) : '',
      entry.user_agent ? sanitizeForSpreadsheet(entry.user_agent) : '',
      entry.session_id ? sanitizeForSpreadsheet(entry.session_id) : '',
    ];
  }

  private async fetchAllAuditLogs(): Promise<AuditLogEntry[]> {
    const rawRows = await this.client.getValues('Audit Logs!A2:K');
    return rawRows
      .filter((r) => r.length > 0 && r[0])
      .map((row) => this.mapRowToAuditLog(row));
  }

  async findById(auditId: string): Promise<AuditLogEntry | null> {
    const entries = await this.fetchAllAuditLogs();
    return entries.find((e) => e.audit_id === auditId) ?? null;
  }

  async findMany(filters: AuditLogFilterCriteria = {}): Promise<PaginatedResult<AuditLogEntry>> {
    const entries = await this.fetchAllAuditLogs();

    const filtered = entries.filter((e) => {
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

    const items = filtered.slice(startIndex, startIndex + limit);
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
    return this.writeMutex.runExclusive(async () => {
      const entry: AuditLogEntry = {
        ...input,
        timestamp: new Date().toISOString(),
      };

      const row = this.mapAuditLogToRow(entry);
      await this.client.appendValues('Audit Logs!A:K', [row]);
      return entry;
    });
  }
}
