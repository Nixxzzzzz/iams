/**
 * Notification Domain Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.12
 */

export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'ASSIGNMENT',
  OVERDUE: 'OVERDUE',
  REQUEST_STATUS: 'REQUEST_STATUS',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  MAINTENANCE: 'MAINTENANCE',
  WARRANTY_EXPIRING: 'WARRANTY_EXPIRING',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface Notification {
  notification_id: string; // NTF-000001
  user_id: string; // USR-000001
  type: NotificationType;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}
