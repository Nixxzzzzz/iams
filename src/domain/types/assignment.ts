import { CustodyType } from './asset';

/**
 * Assignment Domain Entity & Enums
 * Source of Truth: docs/DATABASE_DESIGN.md §3.6
 */

export const ASSIGNMENT_TYPES = {
  PERMANENT: 'PERMANENT',
  TEMPORARY: 'TEMPORARY',
  DEPARTMENT_SHARED: 'DEPARTMENT_SHARED',
} as const;

export type AssignmentType = (typeof ASSIGNMENT_TYPES)[keyof typeof ASSIGNMENT_TYPES];

export const ASSIGNMENT_STATUSES = {
  ACTIVE: 'ACTIVE',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
  TRANSFERRED: 'TRANSFERRED',
} as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[keyof typeof ASSIGNMENT_STATUSES];

export interface Assignment {
  assignment_id: string; // ASN-000001
  asset_id: string; // AST-000001
  custody_type: CustodyType;
  user_id?: string | null; // USR-000001
  department_id?: string | null; // DEP-000001
  assignment_type: AssignmentType;
  assigned_at: string; // ISO-8601
  expected_return_at?: string | null; // ISO-8601
  returned_at?: string | null; // ISO-8601
  assigned_condition: string;
  returned_condition?: string | null;
  assigned_by: string; // USR-000001
  returned_by?: string | null;
  status: AssignmentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
