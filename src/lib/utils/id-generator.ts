import { ID_PREFIXES, ID_PAD_LENGTH } from '@/config/constants';

/**
 * Sequential Natural Key Identifier Utilities
 * Source of Truth: docs/DATABASE_DESIGN.md §1.1, docs/GOOGLE_SHEETS_INTEGRATION.md §4.2
 */

export function formatEntityId(prefix: string, sequenceNumber: number): string {
  if (sequenceNumber < 1) {
    throw new Error(`Sequence number must be a positive integer, received: ${sequenceNumber}`);
  }
  const padded = String(sequenceNumber).padStart(ID_PAD_LENGTH, '0');
  return `${prefix}${padded}`;
}

export function parseEntitySequence(id: string, prefix: string): number {
  if (!id.startsWith(prefix)) {
    throw new Error(`ID '${id}' does not start with expected prefix '${prefix}'`);
  }
  const numStr = id.slice(prefix.length);
  const parsed = parseInt(numStr, 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric suffix in ID '${id}'`);
  }
  return parsed;
}

export const ID_REGEX = {
  ASSET: /^AST-[0-9]{6}$/,
  USER: /^USR-[0-9]{6}$/,
  DEPARTMENT: /^DEP-[0-9]{6}$/,
  LOCATION: /^LOC-[0-9]{6}$/,
  CATEGORY: /^CAT-[0-9]{6}$/,
  ASSIGNMENT: /^ASN-[0-9]{6}$/,
  TRANSACTION: /^TXN-[0-9]{6}$/,
  MAINTENANCE: /^MNT-[0-9]{6}$/,
  REQUEST: /^REQ-[0-9]{6}$/,
  VENDOR: /^VEN-[0-9]{6}$/,
  DOCUMENT: /^DOC-[0-9]{6}$/,
  NOTIFICATION: /^NTF-[0-9]{6}$/,
  AUDIT_LOG: /^AUD-[0-9]{6}$/,
} as const;

export function isValidId(id: string, entityType: keyof typeof ID_PREFIXES): boolean {
  const regex = ID_REGEX[entityType];
  return regex ? regex.test(id) : false;
}
