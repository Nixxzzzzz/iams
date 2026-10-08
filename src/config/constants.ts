/**
 * Global System Constants
 * Source of Truth: docs/DATABASE_DESIGN.md, docs/PROJECT_RULES.md, docs/ARCHITECTURE.md
 */

export const DEFAULT_CURRENCY = 'INR' as const;
export const DEFAULT_CURRENCY_SYMBOL = '₹' as const;

export const ID_PREFIXES = {
  ASSET: 'AST-',
  USER: 'USR-',
  DEPARTMENT: 'DEP-',
  LOCATION: 'LOC-',
  CATEGORY: 'CAT-',
  ASSIGNMENT: 'ASN-',
  TRANSACTION: 'TXN-',
  MAINTENANCE: 'MNT-',
  REQUEST: 'REQ-',
  VENDOR: 'VEN-',
  DOCUMENT: 'DOC-',
  NOTIFICATION: 'NTF-',
  AUDIT_LOG: 'AUD-',
} as const;

export const ID_PAD_LENGTH = 6;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 25,
  ALLOWED_PAGE_SIZES: [25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

export const AUTH_DEFAULTS = {
  ALLOWED_EMAIL_DOMAINS_NOT_CONFIGURED: 'NOT_CONFIGURED',
  SESSION_COOKIE_NAME: 'asset_mgmt_session',
  SESSION_MAX_AGE_SECONDS: 60 * 60 * 8, // 8 hours
} as const;
