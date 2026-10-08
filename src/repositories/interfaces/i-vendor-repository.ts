import { Vendor } from '@/domain/types/vendor';
import { PaginationParams, PaginatedResult } from './common';

export type NewVendorInput = Omit<Vendor, 'created_at' | 'updated_at'>;
export type VendorUpdateInput = Partial<Omit<Vendor, 'vendor_id' | 'created_at'>>;

export interface IVendorRepository {
  findById(vendorId: string): Promise<Vendor | null>;
  findMany(filters?: PaginationParams): Promise<PaginatedResult<Vendor>>;
  create(vendor: NewVendorInput): Promise<Vendor>;
  update(vendorId: string, updates: VendorUpdateInput): Promise<Vendor>;
}
