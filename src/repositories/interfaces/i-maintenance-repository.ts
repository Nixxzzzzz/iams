import { MaintenanceTicket, MaintenanceStatus, MaintenancePriority } from '@/domain/types/maintenance';
import { PaginationParams, PaginatedResult } from './common';

export interface MaintenanceFilterCriteria extends PaginationParams {
  asset_id?: string;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  assigned_to?: string;
  vendor_id?: string;
}

export type NewMaintenanceInput = Omit<MaintenanceTicket, 'created_at' | 'updated_at'>;
export type MaintenanceUpdateInput = Partial<Omit<MaintenanceTicket, 'maintenance_id' | 'created_at'>>;

export interface IMaintenanceRepository {
  findById(maintenanceId: string): Promise<MaintenanceTicket | null>;
  findMany(filters?: MaintenanceFilterCriteria): Promise<PaginatedResult<MaintenanceTicket>>;
  create(ticket: NewMaintenanceInput): Promise<MaintenanceTicket>;
  update(maintenanceId: string, updates: MaintenanceUpdateInput): Promise<MaintenanceTicket>;
}
