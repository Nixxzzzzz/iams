import { Asset } from '@/domain/types/asset';
import {
  IAssetRepository,
  AssetFilterCriteria,
  NewAssetInput,
  AssetUpdateInput,
} from '@/repositories/interfaces/i-asset-repository';
import { PaginatedResult } from '@/repositories/interfaces/common';
import { GoogleSheetsClient } from '@/lib/google-sheets/sheets-client';
import { mapRowToAsset, mapAssetToRow, SheetCellValue } from '@/lib/google-sheets/asset-row-mapper';
import { Mutex } from '@/lib/utils/mutex';
import { PAGINATION } from '@/config/constants';
import { NotFoundError } from '@/lib/errors/app-error';

/**
 * Google Sheets Asset Repository Adapter
 * Source of Truth: docs/GOOGLE_SHEETS_INTEGRATION.md §3.1 & §6, docs/DATABASE_DESIGN.md §3.1
 *
 * Implements IAssetRepository over Google Sheets API v4.
 * Thread-safe via Mutex to prevent read-modify-write collisions.
 */

export class GoogleSheetsAssetRepository implements IAssetRepository {
  private client: GoogleSheetsClient;
  private writeMutex = new Mutex();

  constructor(client: GoogleSheetsClient) {
    this.client = client;
  }

  /**
   * Fetches all rows from the Assets sheet (starting row 2).
   */
  private async fetchAllAssetRows(): Promise<{ rows: SheetCellValue[][]; assets: Asset[] }> {
    const rawRows = await this.client.getValues('Assets!A2:AD');
    const assets = rawRows
      .filter((r) => r.length > 0 && r[0]) // Filter empty rows
      .map((row) => mapRowToAsset(row));
    return { rows: rawRows, assets };
  }

  async findById(assetId: string): Promise<Asset | null> {
    const { assets } = await this.fetchAllAssetRows();
    const match = assets.find((a) => a.asset_id === assetId);
    return match ?? null;
  }

  async findByTag(assetTag: string): Promise<Asset | null> {
    const { assets } = await this.fetchAllAssetRows();
    const match = assets.find((a) => a.asset_tag.toLowerCase() === assetTag.toLowerCase());
    return match ?? null;
  }

  async findBySerialNumber(serialNumber: string): Promise<Asset | null> {
    const { assets } = await this.fetchAllAssetRows();
    const match = assets.find(
      (a) => a.serial_number && a.serial_number.toLowerCase() === serialNumber.toLowerCase()
    );
    return match ?? null;
  }

  async findMany(filters: AssetFilterCriteria = {}): Promise<PaginatedResult<Asset>> {
    const { assets } = await this.fetchAllAssetRows();

    // 1. Filter
    const filtered = assets.filter((asset) => {
      // Archive filter
      const targetArchived = filters.is_archived ?? false;
      if (asset.is_archived !== targetArchived) return false;

      if (filters.category_id && asset.category_id !== filters.category_id) return false;
      if (filters.status && asset.status !== filters.status) return false;
      if (filters.condition && asset.condition !== filters.condition) return false;
      if (filters.department_id && asset.department_id !== filters.department_id) return false;
      if (filters.location_id && asset.location_id !== filters.location_id) return false;
      if (filters.custody_type && asset.custody_type !== filters.custody_type) return false;
      if (filters.current_user_id && asset.current_user_id !== filters.current_user_id) return false;

      // Free-text search across prominent identifier & descriptor fields
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

    // 2. Sort
    const sortBy = (filters.sortBy as keyof Asset) || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    // 3. Paginate
    const total = filtered.length;
    const page = Math.max(1, filters.page ?? PAGINATION.DEFAULT_PAGE);
    const limit = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(1, filters.limit ?? PAGINATION.DEFAULT_PAGE_SIZE)
    );
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

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
    return this.writeMutex.runExclusive(async () => {
      const now = new Date().toISOString();
      const asset: Asset = {
        ...newAsset,
        is_archived: false,
        created_at: now,
        updated_at: now,
        archived_at: null,
      };

      const rowValues = mapAssetToRow(asset);
      await this.client.appendValues('Assets!A:AD', [rowValues]);
      return asset;
    });
  }

  async update(assetId: string, updates: AssetUpdateInput): Promise<Asset> {
    return this.writeMutex.runExclusive(async () => {
      const { assets } = await this.fetchAllAssetRows();
      const index = assets.findIndex((a) => a.asset_id === assetId);

      if (index === -1) {
        throw new NotFoundError('Asset', assetId);
      }

      const existing = assets[index];
      const now = new Date().toISOString();

      const updatedAsset: Asset = {
        ...existing,
        ...updates,
        // Invariant: asset_id and created_at cannot be mutated
        asset_id: existing.asset_id,
        created_at: existing.created_at,
        updated_at: now,
      };

      const rowValues = mapAssetToRow(updatedAsset);
      const rowNumber = index + 2; // Row 1 is header, data starts at row 2
      await this.client.updateValues(`Assets!A${rowNumber}:AD${rowNumber}`, [rowValues]);

      return updatedAsset;
    });
  }

  async archive(assetId: string, reason: string): Promise<Asset> {
    return this.writeMutex.runExclusive(async () => {
      const now = new Date().toISOString();
      return await this.update(assetId, {
        is_archived: true,
        archived_at: now,
        description: reason ? `[ARCHIVED: ${reason}]` : undefined,
      });
    });
  }
}
