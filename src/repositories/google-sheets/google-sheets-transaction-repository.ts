import { TransactionLedgerEntry, TransactionType } from '@/domain/types/transaction';
import {
  ITransactionRepository,
  TransactionFilterCriteria,
  NewTransactionInput,
} from '@/repositories/interfaces/i-transaction-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { GoogleSheetsClient } from '@/lib/google-sheets/sheets-client';
import { SheetCellValue } from '@/lib/google-sheets/asset-row-mapper';
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '@/lib/utils/sanitize';
import { Mutex } from '@/lib/utils/mutex';
import { PAGINATION } from '@/config/constants';

/**
 * Google Sheets Append-Only Transaction Repository Adapter
 * Source of Truth: docs/DATABASE_DESIGN.md §3.7, docs/PROJECT_RULES.md §3
 *
 * Immutability Contract:
 * Appends rows only. No updates or deletions are exposed or supported.
 */

export class GoogleSheetsTransactionRepository implements ITransactionRepository {
  private client: GoogleSheetsClient;
  private writeMutex = new Mutex();

  constructor(client: GoogleSheetsClient) {
    this.client = client;
  }

  private mapRowToTransaction(row: SheetCellValue[]): TransactionLedgerEntry {
    const getStr = (index: number): string | null => {
      const raw = row[index];
      if (raw === undefined || raw === null || raw === '') return null;
      return desanitizeFromSpreadsheet(String(raw).trim());
    };

    let metadata: Record<string, unknown> | null = null;
    const metaStr = getStr(9);
    if (metaStr) {
      try {
        metadata = JSON.parse(metaStr);
      } catch {
        metadata = null;
      }
    }

    return {
      transaction_id: getStr(0) ?? '',
      asset_id: getStr(1) ?? '',
      transaction_type: (getStr(2) ?? 'CREATED') as TransactionType,
      timestamp: getStr(3) ?? new Date().toISOString(),
      performed_by: getStr(4) ?? '',
      previous_state: getStr(5),
      new_state: getStr(6) ?? '',
      related_assignment_id: getStr(7),
      notes: getStr(8),
      metadata,
    };
  }

  private mapTransactionToRow(entry: TransactionLedgerEntry): SheetCellValue[] {
    const metaStr = entry.metadata ? sanitizeForSpreadsheet(JSON.stringify(entry.metadata)) : '{}';
    return [
      sanitizeForSpreadsheet(entry.transaction_id),
      sanitizeForSpreadsheet(entry.asset_id),
      entry.transaction_type,
      entry.timestamp,
      sanitizeForSpreadsheet(entry.performed_by),
      entry.previous_state ? sanitizeForSpreadsheet(entry.previous_state) : '',
      sanitizeForSpreadsheet(entry.new_state),
      entry.related_assignment_id ? sanitizeForSpreadsheet(entry.related_assignment_id) : '',
      entry.notes ? sanitizeForSpreadsheet(entry.notes) : '',
      metaStr,
    ];
  }

  private async fetchAllTransactions(): Promise<TransactionLedgerEntry[]> {
    const rawRows = await this.client.getValues('Transactions!A2:J');
    return rawRows
      .filter((r) => r.length > 0 && r[0])
      .map((row) => this.mapRowToTransaction(row));
  }

  async findById(transactionId: string): Promise<TransactionLedgerEntry | null> {
    const entries = await this.fetchAllTransactions();
    return entries.find((e) => e.transaction_id === transactionId) ?? null;
  }

  async findByAssetId(assetId: string): Promise<TransactionLedgerEntry[]> {
    const entries = await this.fetchAllTransactions();
    return entries.filter((e) => e.asset_id === assetId);
  }

  async findMany(filters: TransactionFilterCriteria = {}): Promise<PaginatedResult<TransactionLedgerEntry>> {
    const entries = await this.fetchAllTransactions();

    const filtered = entries.filter((e) => {
      if (filters.asset_id && e.asset_id !== filters.asset_id) return false;
      if (filters.transaction_type && e.transaction_type !== filters.transaction_type) return false;
      if (filters.performed_by && e.performed_by !== filters.performed_by) return false;
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

  async append(input: NewTransactionInput): Promise<TransactionLedgerEntry> {
    return this.writeMutex.runExclusive(async () => {
      const entry: TransactionLedgerEntry = {
        ...input,
        timestamp: new Date().toISOString(),
      };

      const row = this.mapTransactionToRow(entry);
      await this.client.appendValues('Transactions!A:J', [row]);
      return entry;
    });
  }
}
