import { ASSET_STATUSES, AssetStatus } from '../types/asset';
import { TRANSACTION_TYPES, TransactionType } from '../types/transaction';
import { InvalidStateTransitionError } from '@/lib/errors/app-error';

/**
 * Pure Domain Asset Lifecycle State Machine
 * Source of Truth: docs/ASSET_LIFECYCLE.md §1 & §3
 *
 * PURE: Zero dependencies on HTTP, React, Database, or environment.
 */

const VALID_TRANSITIONS: Readonly<Record<AssetStatus, readonly AssetStatus[]>> = {
  [ASSET_STATUSES.ACQUIRED]: [ASSET_STATUSES.AVAILABLE],
  [ASSET_STATUSES.AVAILABLE]: [
    ASSET_STATUSES.ASSIGNED,
    ASSET_STATUSES.CHECKED_OUT,
    ASSET_STATUSES.RESERVED,
    ASSET_STATUSES.IN_MAINTENANCE,
    ASSET_STATUSES.LOST,
    ASSET_STATUSES.PENDING_RETIREMENT,
  ],
  [ASSET_STATUSES.RESERVED]: [
    ASSET_STATUSES.ASSIGNED,
    ASSET_STATUSES.CHECKED_OUT,
    ASSET_STATUSES.AVAILABLE, // Cancel reservation
  ],
  [ASSET_STATUSES.ASSIGNED]: [
    ASSET_STATUSES.IN_USE,
    ASSET_STATUSES.AVAILABLE, // Cancel assignment before handover
  ],
  [ASSET_STATUSES.CHECKED_OUT]: [
    ASSET_STATUSES.IN_USE,
    ASSET_STATUSES.AVAILABLE, // Cancel checkout before handover
  ],
  [ASSET_STATUSES.IN_USE]: [
    ASSET_STATUSES.RETURNED,
    ASSET_STATUSES.IN_MAINTENANCE,
    ASSET_STATUSES.LOST,
  ],
  [ASSET_STATUSES.RETURNED]: [ASSET_STATUSES.INSPECTION],
  [ASSET_STATUSES.INSPECTION]: [
    ASSET_STATUSES.AVAILABLE,
    ASSET_STATUSES.IN_MAINTENANCE,
    ASSET_STATUSES.DAMAGED,
    ASSET_STATUSES.PENDING_RETIREMENT,
  ],
  [ASSET_STATUSES.IN_MAINTENANCE]: [
    ASSET_STATUSES.INSPECTION,
    ASSET_STATUSES.DAMAGED,
    ASSET_STATUSES.PENDING_RETIREMENT,
  ],
  [ASSET_STATUSES.DAMAGED]: [
    ASSET_STATUSES.IN_MAINTENANCE,
    ASSET_STATUSES.PENDING_RETIREMENT,
  ],
  [ASSET_STATUSES.LOST]: [
    ASSET_STATUSES.AVAILABLE, // Found in storage
    ASSET_STATUSES.IN_USE,    // Found in employee custody
    ASSET_STATUSES.PENDING_RETIREMENT, // Written off
  ],
  [ASSET_STATUSES.PENDING_RETIREMENT]: [
    ASSET_STATUSES.RETIRED,
  ],
  [ASSET_STATUSES.RETIRED]: [
    ASSET_STATUSES.DISPOSED,
    ASSET_STATUSES.SOLD,
    ASSET_STATUSES.DONATED,
  ],
  // Terminal states (no transitions allowed)
  [ASSET_STATUSES.DISPOSED]: [],
  [ASSET_STATUSES.SOLD]: [],
  [ASSET_STATUSES.DONATED]: [],
};

export function canTransition(from: AssetStatus, to: AssetStatus): boolean {
  if (from === to) return false;
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function validateTransition(from: AssetStatus, to: AssetStatus, contextReason?: string): void {
  if (!canTransition(from, to)) {
    throw new InvalidStateTransitionError(from, to, contextReason);
  }
}

export function getAllowedNextStates(current: AssetStatus): readonly AssetStatus[] {
  return VALID_TRANSITIONS[current] ?? [];
}

export function isTerminalState(status: AssetStatus): boolean {
  return (
    status === ASSET_STATUSES.DISPOSED ||
    status === ASSET_STATUSES.SOLD ||
    status === ASSET_STATUSES.DONATED
  );
}

export function resolveTransactionType(from: AssetStatus, to: AssetStatus): TransactionType {
  if (from === ASSET_STATUSES.ACQUIRED && to === ASSET_STATUSES.AVAILABLE) {
    return TRANSACTION_TYPES.COMMISSION;
  }
  if (to === ASSET_STATUSES.ASSIGNED) {
    return TRANSACTION_TYPES.ASSIGN;
  }
  if (to === ASSET_STATUSES.CHECKED_OUT) {
    return TRANSACTION_TYPES.CHECK_OUT;
  }
  if (to === ASSET_STATUSES.RETURNED) {
    return TRANSACTION_TYPES.CHECK_IN;
  }
  if (to === ASSET_STATUSES.IN_MAINTENANCE) {
    return TRANSACTION_TYPES.SEND_TO_MAINTENANCE;
  }
  if (from === ASSET_STATUSES.IN_MAINTENANCE && to === ASSET_STATUSES.INSPECTION) {
    return TRANSACTION_TYPES.RETURN_FROM_MAINTENANCE;
  }
  if (to === ASSET_STATUSES.LOST) {
    return TRANSACTION_TYPES.REPORT_LOST;
  }
  if (from === ASSET_STATUSES.LOST) {
    return TRANSACTION_TYPES.REPORT_FOUND;
  }
  if (to === ASSET_STATUSES.RETIRED) {
    return TRANSACTION_TYPES.RETIREMENT;
  }
  if (to === ASSET_STATUSES.DISPOSED) {
    return TRANSACTION_TYPES.DISPOSAL;
  }
  if (to === ASSET_STATUSES.SOLD) {
    return TRANSACTION_TYPES.SALE;
  }
  if (to === ASSET_STATUSES.DONATED) {
    return TRANSACTION_TYPES.DONATION;
  }
  return TRANSACTION_TYPES.CONDITION_UPDATE;
}
