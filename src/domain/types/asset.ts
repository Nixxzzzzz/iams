/**
 * Asset Domain Entity & Enums
 * Source of Truth: docs/DATABASE_DESIGN.md §3.1, docs/ASSET_LIFECYCLE.md
 */

export const ASSET_STATUSES = {
  ACQUIRED: 'ACQUIRED',
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  ASSIGNED: 'ASSIGNED',
  CHECKED_OUT: 'CHECKED_OUT',
  IN_USE: 'IN_USE',
  RETURNED: 'RETURNED',
  INSPECTION: 'INSPECTION',
  IN_MAINTENANCE: 'IN_MAINTENANCE',
  DAMAGED: 'DAMAGED',
  LOST: 'LOST',
  PENDING_RETIREMENT: 'PENDING_RETIREMENT',
  RETIRED: 'RETIRED',
  DISPOSED: 'DISPOSED',
  SOLD: 'SOLD',
  DONATED: 'DONATED',
} as const;

export type AssetStatus = (typeof ASSET_STATUSES)[keyof typeof ASSET_STATUSES];

export const ASSET_CONDITIONS = {
  NEW: 'NEW',
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  DAMAGED: 'DAMAGED',
} as const;

export type AssetCondition = (typeof ASSET_CONDITIONS)[keyof typeof ASSET_CONDITIONS];

export const CUSTODY_TYPES = {
  NONE: 'NONE',
  USER: 'USER',
  DEPARTMENT: 'DEPARTMENT',
} as const;

export type CustodyType = (typeof CUSTODY_TYPES)[keyof typeof CUSTODY_TYPES];

export interface Asset {
  asset_id: string; // AST-000001
  asset_tag: string; // TAG-10042
  name: string;
  category_id: string; // CAT-000001
  subcategory?: string | null;
  brand: string;
  model?: string | null;
  serial_number?: string | null;
  description?: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  custody_type: CustodyType;
  department_id?: string | null; // DEP-000001
  location_id?: string | null; // LOC-000001
  current_user_id?: string | null; // USR-000001
  current_assignment_id?: string | null; // ASN-000001
  purchase_date?: string | null; // YYYY-MM-DD
  purchase_cost?: number | null;
  useful_life_months?: number | null;
  current_value?: number | null;
  currency: string; // INR
  vendor_id?: string | null; // VEN-000001
  invoice_reference?: string | null;
  warranty_start?: string | null;
  warranty_expiry?: string | null;
  custom_fields?: Record<string, unknown> | null; // Structured specs JSON
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string | null;
}
