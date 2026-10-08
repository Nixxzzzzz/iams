import { TransactionLedgerEntry, TransactionType } from '@/domain/types/transaction';
import { PaginationParams, PaginatedResult } from './common';

/**
 * Append-Only Transaction Ledger Repository Interface
 * Source of Truth: docs/DATABASE_DESIGN.md §3.7, docs/ASSET_LIFECYCLE.md §3, docs/PROJECT_RULES.md §3
 *
 * CRITICAL ARCHITECTURAL CONTRACT:
 * Transactions is an append-only immutable ledger.
 * This interface intentionally exposes NO update and NO delete methods.
 */

export interface TransactionFilterCriteria extends PaginationParams {
  asset_id?: string;
  transaction_type?: TransactionType;
  performed_by?: string;
  startDate?: string;
  endDate?: string;
}

export type NewTransactionInput = Omit<TransactionLedgerEntry, 'timestamp'>;

export interface ITransactionRepository {
  findById(transactionId: string): Promise<TransactionLedgerEntry | null>;
  findMany(filters?: TransactionFilterCriteria): Promise<PaginatedResult<TransactionLedgerEntry>>;
  findByAssetId(assetId: string): Promise<TransactionLedgerEntry[]>;
  /**
   * Appends an immutable lifecycle record to the ledger.
   */
  append(entry: NewTransactionInput): Promise<TransactionLedgerEntry>;
}
