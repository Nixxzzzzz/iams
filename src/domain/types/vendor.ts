/**
 * Vendor Domain Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.10
 */

export interface Vendor {
  vendor_id: string; // VEN-000001
  name: string;
  vendor_type: 'SUPPLIER' | 'MANUFACTURER' | 'SERVICE_PROVIDER' | 'OTHER';
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  tax_identifier?: string | null;
  notes?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}
