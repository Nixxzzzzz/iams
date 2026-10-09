import { z } from 'zod';
import {
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  CUSTODY_TYPES,
  AssetStatus,
  AssetCondition,
  CustodyType,
} from '@/domain/types/asset';
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
 * Source of Truth: docs/DATABASE_DESIGN.md §3.1, docs/ASSET_LIFECYCLE.md §3
 */

const assetStatusValues = Object.values(ASSET_STATUSES) as [AssetStatus, ...AssetStatus[]];
export const assetStatusEnum = z.enum(assetStatusValues);

const assetConditionValues = Object.values(ASSET_CONDITIONS) as [AssetCondition, ...AssetCondition[]];
export const assetConditionEnum = z.enum(assetConditionValues);

const custodyTypeValues = Object.values(CUSTODY_TYPES) as [CustodyType, ...CustodyType[]];
export const custodyTypeEnum = z.enum(custodyTypeValues);

export const assetTagSchema = z
  .string()
  .trim()
  .min(3, 'Asset tag must be at least 3 characters')
  .max(50, 'Asset tag must not exceed 50 characters')
  .regex(/^[A-Za-z0-9_-]+$/, 'Asset tag must be alphanumeric (hyphens and underscores allowed)');

export const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/, 'Currency must be an exact 3-letter ISO 4217 code (e.g., INR, USD)')
  .default(DEFAULT_CURRENCY);

export const createAssetSchema = z
  .object({
    asset_tag: assetTagSchema,
    name: safeStringSchema(1, 150),
    category_id: idPattern(ID_PREFIXES.CATEGORY),
    subcategory: optionalSafeStringSchema(80),
    brand: safeStringSchema(1, 80),
    model: optionalSafeStringSchema(100),
    serial_number: optionalSafeStringSchema(100),
    description: optionalSafeStringSchema(1000),
    status: assetStatusEnum.default(ASSET_STATUSES.ACQUIRED),
    condition: assetConditionEnum.default(ASSET_CONDITIONS.NEW),
    custody_type: custodyTypeEnum.default(CUSTODY_TYPES.NONE),
    location_id: idPattern(ID_PREFIXES.LOCATION).optional().nullable(),
    department_id: idPattern(ID_PREFIXES.DEPARTMENT).optional().nullable(),
    current_user_id: idPattern(ID_PREFIXES.USER).optional().nullable(),
    purchase_date: optionalDateStringSchema,
    purchase_cost: z.coerce.number().min(0, 'Purchase cost must be non-negative').optional().nullable(),
    useful_life_months: z.coerce.number().int().min(0, 'Useful life must be non-negative').optional().nullable(),
    current_value: z.coerce.number().min(0, 'Current value must be non-negative').optional().nullable(),
    currency: currencySchema,
    vendor_id: idPattern(ID_PREFIXES.VENDOR).optional().nullable(),
    invoice_reference: optionalSafeStringSchema(80),
    warranty_start: optionalDateStringSchema,
    warranty_expiry: optionalDateStringSchema,
    custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // Warranty date validation
    if (data.warranty_start && data.warranty_expiry) {
      if (data.warranty_expiry < data.warranty_start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Warranty expiry date cannot precede warranty start date',
          path: ['warranty_expiry'],
        });
      }
    }

    // Custody constraint validation
    if (data.custody_type === CUSTODY_TYPES.USER && !data.current_user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A valid user ID is required when custody type is USER',
        path: ['current_user_id'],
      });
    }

    // Custom fields payload limit (max 5000 characters serialized)
    if (data.custom_fields) {
      const serialized = JSON.stringify(data.custom_fields);
      if (serialized.length > 5000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Custom specifications JSON payload must not exceed 5000 characters',
          path: ['custom_fields'],
        });
      }
    }
  });

export const updateAssetSchema = z
  .object({
    name: safeStringSchema(1, 150).optional(),
    category_id: idPattern(ID_PREFIXES.CATEGORY).optional(),
    subcategory: optionalSafeStringSchema(80).optional(),
    brand: safeStringSchema(1, 80).optional(),
    model: optionalSafeStringSchema(100).optional(),
    serial_number: optionalSafeStringSchema(100).optional(),
    description: optionalSafeStringSchema(1000).optional(),
    status: assetStatusEnum.optional(),
    condition: assetConditionEnum.optional(),
    custody_type: custodyTypeEnum.optional(),
    location_id: idPattern(ID_PREFIXES.LOCATION).optional().nullable(),
    department_id: idPattern(ID_PREFIXES.DEPARTMENT).optional().nullable(),
    current_user_id: idPattern(ID_PREFIXES.USER).optional().nullable(),
    purchase_date: optionalDateStringSchema.optional(),
    purchase_cost: z.coerce.number().min(0).optional().nullable(),
    useful_life_months: z.coerce.number().int().min(0).optional().nullable(),
    current_value: z.coerce.number().min(0).optional().nullable(),
    currency: currencySchema.optional(),
    vendor_id: idPattern(ID_PREFIXES.VENDOR).optional().nullable(),
    invoice_reference: optionalSafeStringSchema(80).optional(),
    warranty_start: optionalDateStringSchema.optional(),
    warranty_expiry: optionalDateStringSchema.optional(),
    custom_fields: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.warranty_start && data.warranty_expiry) {
      if (data.warranty_expiry < data.warranty_start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Warranty expiry date cannot precede warranty start date',
          path: ['warranty_expiry'],
        });
      }
    }
  });

export const assetFilterSchema = paginationQuerySchema.extend({
  category_id: z.string().optional(),
  status: assetStatusEnum.optional(),
  condition: assetConditionEnum.optional(),
  department_id: z.string().optional(),
  location_id: z.string().optional(),
  custody_type: custodyTypeEnum.optional(),
  current_user_id: z.string().optional(),
});

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type CreateAssetInput = z.input<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type UpdateAssetInput = z.input<typeof updateAssetSchema>;
export type AssetFilterDTO = z.infer<typeof assetFilterSchema>;
export type AssetFilterInput = z.input<typeof assetFilterSchema>;
