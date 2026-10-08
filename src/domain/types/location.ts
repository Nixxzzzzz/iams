/**
 * Location Domain Entity & Hierarchy
 * Source of Truth: docs/DATABASE_DESIGN.md §3.5
 */

export const LOCATION_TYPES = {
  SITE: 'SITE',
  BUILDING: 'BUILDING',
  FLOOR: 'FLOOR',
  ROOM: 'ROOM',
  STORAGE_AREA: 'STORAGE_AREA',
} as const;

export type LocationType = (typeof LOCATION_TYPES)[keyof typeof LOCATION_TYPES];

export interface Location {
  location_id: string; // LOC-000001
  name: string;
  location_type: LocationType;
  parent_location_id?: string | null; // LOC-000001
  code?: string | null;
  address?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}
