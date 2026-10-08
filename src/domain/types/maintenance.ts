/**
 * Maintenance & Service Ticket Domain Entity & Enums
 * Source of Truth: docs/DATABASE_DESIGN.md §3.8
 */

export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'PREVENTIVE',
  CORRECTIVE: 'CORRECTIVE',
  UPGRADE: 'UPGRADE',
  INSPECTION: 'INSPECTION',
} as const;

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[keyof typeof MAINTENANCE_TYPES];

export const MAINTENANCE_STATUSES = {
  REPORTED: 'REPORTED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_PARTS: 'WAITING_PARTS',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
} as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[keyof typeof MAINTENANCE_STATUSES];

export const MAINTENANCE_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[keyof typeof MAINTENANCE_PRIORITIES];

export interface MaintenanceTicket {
  maintenance_id: string; // MNT-000001
  asset_id: string; // AST-000001
  maintenance_type: MaintenanceType;
  issue: string;
  description?: string | null;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  reported_by: string; // USR-000001
  assigned_to?: string | null; // USR-000001
  vendor_id?: string | null; // VEN-000001
  reported_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  resolution?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}
