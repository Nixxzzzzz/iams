import { z } from 'zod';
import { ASSET_STATUSES, ASSET_CONDITIONS, CUSTODY_TYPES } from '@/domain/types/asset';
import { ID_PREFIXES, DEFAULT_CURRENCY } from '@/config/constants';
import {
  idPattern,
  safeStringSchema,
  optionalSafeStringSchema,
  optionalDateStringSchema,
  paginationQuerySchema,
} from './common.schema';

/**
 * Asset Validation Schemas
 * Source of Truth: docs/DATABASE_DESIGN.md §3.1
 */

export const createAssetSchema = z.object({
  name: safeStringSchema(1, 150),
  category_id: idPattern(ID_PREFIXES.CATEGORY),
  subcategory: optionalSafeStringSchema(80),
  brand: safeStringSchema(1, 80),
  model: optionalSafeStringSchema(100),
  serial_number: optionalSafeStringSchema(100),
  description: optionalSafeStringSchema(1000),
  condition: z.enum(Object.values(ASSET_CONDITIONS) as [string, ...string[]]).default(ASSET_CONDITIONS.NEW),
  location_id: idPattern(ID_PREFIXES.LOCATION).optional().nullable(),
  department_id: idPattern(ID_PREFIXES.DEPARTMENT).optional().nullable(),
  purchase_date: optionalDateStringSchema,
  purchase_cost: z.coerce.number().min(0, 'Purchase cost must be non-negative').optional().nullable(),
  useful_life_months: z.coerce.number().int().min(1).optional().nullable(),
  currency: z.string().trim().max(10).default(DEFAULT_CURRENCY),
  vendor_id: idPattern(ID_PREFIXES.VENDOR).optional().nullable(),
  invoice_reference: optionalSafeStringSchema(100),
  warranty_start: optionalDateStringSchema,
  warranty_expiry: optionalDateStringSchema,
  custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: z.enum(Object.values(ASSET_STATUSES) as [string, ...string[]]).optional(),
});

export const assetFilterSchema = paginationQuerySchema.extend({
  category_id: z.string().optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  department_id: z.string().optional(),
  location_id: z.string().optional(),
  custody_type: z.enum(Object.values(CUSTODY_TYPES) as [string, ...string[]]).optional(),
});

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type AssetFilterDTO = z.infer<typeof assetFilterSchema>;
