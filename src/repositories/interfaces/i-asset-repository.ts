import { Asset, AssetStatus, CustodyType } from '@/domain/types/asset';
import { PaginationParams, PaginatedResult } from './common';

export interface AssetFilterCriteria extends PaginationParams {
  category_id?: string;
  status?: AssetStatus;
  condition?: string;
  department_id?: string;
  location_id?: string;
  custody_type?: CustodyType;
  current_user_id?: string;
  is_archived?: boolean;
}

export type NewAssetInput = Omit<Asset, 'created_at' | 'updated_at' | 'archived_at'>;
export type AssetUpdateInput = Partial<Omit<Asset, 'asset_id' | 'created_at'>>;

export interface IAssetRepository {
  findById(assetId: string): Promise<Asset | null>;
  findByTag(assetTag: string): Promise<Asset | null>;
  findBySerialNumber(serialNumber: string): Promise<Asset | null>;
  findMany(filters?: AssetFilterCriteria): Promise<PaginatedResult<Asset>>;
  create(asset: NewAssetInput): Promise<Asset>;
  update(assetId: string, updates: AssetUpdateInput): Promise<Asset>;
  archive(assetId: string, reason: string): Promise<Asset>;
}
