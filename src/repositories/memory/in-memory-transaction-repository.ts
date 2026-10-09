import { TransactionLedgerEntry } from '@/domain/types/transaction';
import {
  ITransactionRepository,
  TransactionFilterCriteria,
  NewTransactionInput,
} from '@/repositories/interfaces/i-transaction-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { PAGINATION } from '@/config/constants';

/**
 * In-Memory Append-Only Transaction Repository Test Double
 * Source of Truth: docs/DATABASE_DESIGN.md §3.7, docs/PROJECT_RULES.md §3
 */

export class InMemoryTransactionRepository implements ITransactionRepository {
  private entries: TransactionLedgerEntry[] = [];

  constructor(initial: TransactionLedgerEntry[] = []) {
    this.entries = [...initial];
  }

  clear(): void {
    this.entries = [];
  }

  async findById(transactionId: string): Promise<TransactionLedgerEntry | null> {
    const match = this.entries.find((e) => e.transaction_id === transactionId);
    return match ? { ...match } : null;
  }

  async findByAssetId(assetId: string): Promise<TransactionLedgerEntry[]> {
    return this.entries.filter((e) => e.asset_id === assetId).map((e) => ({ ...e }));
  }

  async findMany(filters: TransactionFilterCriteria = {}): Promise<PaginatedResult<TransactionLedgerEntry>> {
    const filtered = this.entries.filter((e) => {
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

  async append(input: NewTransactionInput): Promise<TransactionLedgerEntry> {
    const entry: TransactionLedgerEntry = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    this.entries.push({ ...entry });
    return { ...entry };
  }
}
