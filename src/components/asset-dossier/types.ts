import { AssetStatus, AssetCondition } from '@/domain/types/asset';

export type DossierTabKey =
  | 'overview'
  | 'custody'
  | 'financial'
  | 'maintenance'
  | 'documents';

export interface DossierHeaderData {
  assetId: string;
  assetTag: string;
  name: string;
  status: AssetStatus;
  condition: AssetCondition;
  categoryName?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface SpecItem {
  label: string;
  value: string | number | boolean | null | undefined;
}

export interface CustodyRecord {
  id: string;
  custodianName: string;
  custodianType: 'USER' | 'DEPARTMENT';
  assignmentType: string;
  assignedDate: string;
  returnDate?: string | null;
  status: string;
  notes?: string | null;
}

export interface MaintenanceRecord {
  id: string;
  ticketId: string;
  defectSummary: string;
  priority: string;
  status: string;
  openedDate: string;
  completedDate?: string | null;
  technicianOrVendor?: string | null;
  cost?: number | null;
}

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  isPrivate?: boolean;
  downloadUrl?: string;
}
