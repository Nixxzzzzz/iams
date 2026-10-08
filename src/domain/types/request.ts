/**
 * Asset Requisition Request Domain Entity & Enums
 * Source of Truth: docs/DATABASE_DESIGN.md §3.9
 */

export const REQUEST_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  DEPT_APPROVED: 'DEPT_APPROVED',
  ASSET_APPROVED: 'ASSET_APPROVED',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[keyof typeof REQUEST_STATUSES];

export const REQUEST_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type RequestPriority = (typeof REQUEST_PRIORITIES)[keyof typeof REQUEST_PRIORITIES];

export interface AssetRequest {
  request_id: string; // REQ-000001
  request_number: string;
  requester_user_id: string; // USR-000001
  department_id: string; // DEP-000001
  category_id: string; // CAT-000001
  requested_asset_id?: string | null;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  dept_approver_user_id?: string | null;
  dept_approved_at?: string | null;
  asset_approver_user_id?: string | null;
  asset_approved_at?: string | null;
  rejection_reason?: string | null;
  fulfilled_asset_id?: string | null;
  fulfilled_assignment_id?: string | null;
  created_at: string;
  updated_at: string;
}
