/**
 * Immutable Transaction Ledger Entry
 * Source of Truth: docs/DATABASE_DESIGN.md §3.7, docs/ASSET_LIFECYCLE.md §3
 *
 * Appended upon every state mutation, custody handover, or lifecycle transition.
 * IMMUTABLE: No update or delete operations are permitted.
 */

export const TRANSACTION_TYPES = {
  ACQUISITION: 'ACQUISITION',
  COMMISSION: 'COMMISSION',
  ASSIGN: 'ASSIGN',
  CHECK_OUT: 'CHECK_OUT',
  CHECK_IN: 'CHECK_IN',
  TRANSFER_CUSTODY: 'TRANSFER_CUSTODY',
  TRANSFER_LOCATION: 'TRANSFER_LOCATION',
  CONDITION_UPDATE: 'CONDITION_UPDATE',
  SEND_TO_MAINTENANCE: 'SEND_TO_MAINTENANCE',
  RETURN_FROM_MAINTENANCE: 'RETURN_FROM_MAINTENANCE',
  REPORT_LOST: 'REPORT_LOST',
  REPORT_FOUND: 'REPORT_FOUND',
  RETIREMENT: 'RETIREMENT',
  DISPOSAL: 'DISPOSAL',
  SALE: 'SALE',
  DONATION: 'DONATION',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export interface TransactionLedgerEntry {
  transaction_id: string; // TXN-000001
  asset_id: string; // AST-000001
  transaction_type: TransactionType;
  timestamp: string; // ISO-8601
  performed_by: string; // USR-000001
  previous_state?: string | null;
  new_state: string;
  related_assignment_id?: string | null; // ASN-000001
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
}
