/**
 * Department Domain Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.4
 */

export interface Department {
  department_id: string; // DEP-000001
  name: string;
  code: string;
  description?: string | null;
  manager_user_id?: string | null; // USR-000001
  budget_code?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}
