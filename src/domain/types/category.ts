/**
 * Category Domain Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.3
 */

export interface Category {
  category_id: string; // CAT-000001
  name: string;
  code: string;
  description?: string | null;
  parent_category_id?: string | null; // CAT-000001
  default_useful_life_months?: number | null;
  spec_schema_json?: Record<string, unknown> | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}
