import { Asset, AssetStatus, AssetCondition, CustodyType, ASSET_STATUSES, ASSET_CONDITIONS, CUSTODY_TYPES } from '@/domain/types/asset';
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '@/lib/utils/sanitize';
import { DEFAULT_CURRENCY } from '@/config/constants';

/**
 * Google Sheets Asset Row Serializer & Mapper
 * Source of Truth: docs/DATABASE_DESIGN.md §3.1, docs/GOOGLE_SHEETS_INTEGRATION.md §3.1
 *
 * Exact 30 Columns in Precise Order:
 * Row 1 Headers must match this array identically.
 */
export const ASSET_SHEET_HEADERS = [
  'asset_id',
  'asset_tag',
  'name',
  'category_id',
  'subcategory',
  'brand',
  'model',
  'serial_number',
  'description',
  'status',
  'condition',
  'custody_type',
  'department_id',
  'location_id',
  'current_user_id',
  'current_assignment_id',
  'purchase_date',
  'purchase_cost',
  'useful_life_months',
  'current_value',
  'currency',
  'vendor_id',
  'invoice_reference',
  'warranty_start',
  'warranty_expiry',
  'custom_fields',
  'is_archived',
  'created_at',
  'updated_at',
  'archived_at',
] as const;

export type SheetCellValue = string | number | boolean | null;

/**
 * Serializes a domain Asset into a 30-element spreadsheet row array.
 * Applies formula injection sanitization to all string values.
 */
export function mapAssetToRow(asset: Asset): SheetCellValue[] {
  const sanitizeStr = (val?: string | null): string => {
    if (!val) return '';
    return sanitizeForSpreadsheet(val);
  };

  const serializeNumber = (val?: number | null): string | number => {
    if (val === null || val === undefined || isNaN(val)) return '';
    return val;
  };

  let customFieldsStr = '';
  if (asset.custom_fields && Object.keys(asset.custom_fields).length > 0) {
    customFieldsStr = sanitizeForSpreadsheet(JSON.stringify(asset.custom_fields));
  } else {
    customFieldsStr = '{}';
  }

  const row: SheetCellValue[] = [
    sanitizeStr(asset.asset_id),
    sanitizeStr(asset.asset_tag),
    sanitizeStr(asset.name),
    sanitizeStr(asset.category_id),
    sanitizeStr(asset.subcategory),
    sanitizeStr(asset.brand),
    sanitizeStr(asset.model),
    sanitizeStr(asset.serial_number),
    sanitizeStr(asset.description),
    asset.status,
    asset.condition,
    asset.custody_type,
    sanitizeStr(asset.department_id),
    sanitizeStr(asset.location_id),
    sanitizeStr(asset.current_user_id),
    sanitizeStr(asset.current_assignment_id),
    asset.purchase_date ?? '',
    serializeNumber(asset.purchase_cost),
    serializeNumber(asset.useful_life_months),
    serializeNumber(asset.current_value),
    sanitizeStr(asset.currency || DEFAULT_CURRENCY),
    sanitizeStr(asset.vendor_id),
    sanitizeStr(asset.invoice_reference),
    asset.warranty_start ?? '',
    asset.warranty_expiry ?? '',
    customFieldsStr,
    asset.is_archived ? 'TRUE' : 'FALSE',
    asset.created_at,
    asset.updated_at,
    asset.archived_at ?? '',
  ];

  return row;
}

/**
 * Hydrates a 30-element spreadsheet row array into a domain Asset entity.
 * Applies formula desanitization to text fields.
 */
export function mapRowToAsset(row: SheetCellValue[]): Asset {
  const getStr = (index: number): string | null => {
    const raw = row[index];
    if (raw === undefined || raw === null || raw === '') return null;
    return desanitizeFromSpreadsheet(String(raw).trim());
  };

  const getNumber = (index: number): number | null => {
    const raw = row[index];
    if (raw === undefined || raw === null || raw === '') return null;
    const num = Number(raw);
    return isNaN(num) ? null : num;
  };

  const parseJson = (index: number): Record<string, unknown> | null => {
    const raw = getStr(index);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  };

  const rawStatus = (getStr(9) ?? ASSET_STATUSES.ACQUIRED) as AssetStatus;
  const status: AssetStatus = Object.values(ASSET_STATUSES).includes(rawStatus)
    ? rawStatus
    : ASSET_STATUSES.ACQUIRED;

  const rawCondition = (getStr(10) ?? ASSET_CONDITIONS.NEW) as AssetCondition;
  const condition: AssetCondition = Object.values(ASSET_CONDITIONS).includes(rawCondition)
    ? rawCondition
    : ASSET_CONDITIONS.NEW;

  const rawCustody = (getStr(11) ?? CUSTODY_TYPES.NONE) as CustodyType;
  const custody_type: CustodyType = Object.values(CUSTODY_TYPES).includes(rawCustody)
    ? rawCustody
    : CUSTODY_TYPES.NONE;

  const isArchivedStr = String(row[26] ?? '').trim().toUpperCase();
  const is_archived = isArchivedStr === 'TRUE';

  return {
    asset_id: getStr(0) ?? '',
    asset_tag: getStr(1) ?? '',
    name: getStr(2) ?? '',
    category_id: getStr(3) ?? '',
    subcategory: getStr(4),
    brand: getStr(5) ?? '',
    model: getStr(6),
    serial_number: getStr(7),
    description: getStr(8),
    status,
    condition,
    custody_type,
    department_id: getStr(12),
    location_id: getStr(13),
    current_user_id: getStr(14),
    current_assignment_id: getStr(15),
    purchase_date: getStr(16),
    purchase_cost: getNumber(17),
    useful_life_months: getNumber(18),
    current_value: getNumber(19),
    currency: getStr(20) ?? DEFAULT_CURRENCY,
    vendor_id: getStr(21),
    invoice_reference: getStr(22),
    warranty_start: getStr(23),
    warranty_expiry: getStr(24),
    custom_fields: parseJson(25),
    is_archived,
    created_at: getStr(27) ?? new Date().toISOString(),
    updated_at: getStr(28) ?? new Date().toISOString(),
    archived_at: getStr(29),
  };
}
