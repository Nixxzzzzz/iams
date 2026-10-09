import { Asset } from '@/domain/types/asset';
import {
  IAssetRepository,
  AssetFilterCriteria,
  NewAssetInput,
  AssetUpdateInput,
} from '@/repositories/interfaces/i-asset-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { PAGINATION } from '@/config/constants';
import { NotFoundError } from '@/lib/errors/app-error';

/**
 * In-Memory Deterministic Asset Repository Test Double
 * Source of Truth: docs/ARCHITECTURE.md §2.4, docs/GOOGLE_SHEETS_INTEGRATION.md §6
 *
 * Implements IAssetRepository for unit and contract testing.
 */

export class InMemoryAssetRepository implements IAssetRepository {
  private assets: Asset[] = [];

  constructor(initialAssets: Asset[] = []) {
    this.assets = [...initialAssets];
  }

  clear(): void {
    this.assets = [];
  }

  async findById(assetId: string): Promise<Asset | null> {
    const match = this.assets.find((a) => a.asset_id === assetId);
    return match ? { ...match } : null;
  }

  async findByTag(assetTag: string): Promise<Asset | null> {
    const match = this.assets.find((a) => a.asset_tag.toLowerCase() === assetTag.toLowerCase());
    return match ? { ...match } : null;
  }

  async findBySerialNumber(serialNumber: string): Promise<Asset | null> {
    const match = this.assets.find(
      (a) => a.serial_number && a.serial_number.toLowerCase() === serialNumber.toLowerCase()
    );
    return match ? { ...match } : null;
  }

  async findMany(filters: AssetFilterCriteria = {}): Promise<PaginatedResult<Asset>> {
    const filtered = this.assets.filter((asset) => {
      const targetArchived = filters.is_archived ?? false;
      if (asset.is_archived !== targetArchived) return false;

      if (filters.category_id && asset.category_id !== filters.category_id) return false;
      if (filters.status && asset.status !== filters.status) return false;
      if (filters.condition && asset.condition !== filters.condition) return false;
      if (filters.department_id && asset.department_id !== filters.department_id) return false;
      if (filters.location_id && asset.location_id !== filters.location_id) return false;
      if (filters.custody_type && asset.custody_type !== filters.custody_type) return false;
      if (filters.current_user_id && asset.current_user_id !== filters.current_user_id) return false;

      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.toLowerCase().trim();
        const matchesSearch =
          asset.name.toLowerCase().includes(query) ||
          asset.asset_tag.toLowerCase().includes(query) ||
          asset.asset_id.toLowerCase().includes(query) ||
          (asset.serial_number && asset.serial_number.toLowerCase().includes(query)) ||
          asset.brand.toLowerCase().includes(query) ||
          (asset.model && asset.model.toLowerCase().includes(query)) ||
          (asset.description && asset.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      return true;
    });

    const sortBy = (filters.sortBy as keyof Asset) || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    const total = filtered.length;
    const page = Math.max(1, filters.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(1, filters.limit ?? PAGINATION.DEFAULT_PAGE_SIZE)
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit).map((a) => ({ ...a }));

    return {
      items: paginatedData,
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(newAsset: NewAssetInput): Promise<Asset> {
    const now = new Date().toISOString();
    const asset: Asset = {
      ...newAsset,
      is_archived: false,
      created_at: now,
      updated_at: now,
      archived_at: null,
    };
    this.assets.push({ ...asset });
    return { ...asset };
  }

  async update(assetId: string, updates: AssetUpdateInput): Promise<Asset> {
    const index = this.assets.findIndex((a) => a.asset_id === assetId);
    if (index === -1) {
      throw new NotFoundError('Asset', assetId);
    }

    const existing = this.assets[index];
    const now = new Date().toISOString();

    const updatedAsset: Asset = {
      ...existing,
      ...updates,
      asset_id: existing.asset_id, // Preserved
      created_at: existing.created_at, // Preserved
      updated_at: now,
    };

    this.assets[index] = { ...updatedAsset };
    return { ...updatedAsset };
  }

  async archive(assetId: string, reason: string): Promise<Asset> {
    const now = new Date().toISOString();
    return await this.update(assetId, {
      is_archived: true,
      archived_at: now,
      description: reason ? `[ARCHIVED: ${reason}]` : undefined,
    });
  }
}
