/**
 * System Setting Domain Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.14
 */

export interface SystemSetting {
  key: string;
  value: string;
  value_type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: 'GENERAL' | 'AUTHENTICATION' | 'NOTIFICATIONS' | 'SEQUENCE';
  description?: string | null;
  is_system: boolean;
  updated_by: string; // USR-000001
  updated_at: string;
}
