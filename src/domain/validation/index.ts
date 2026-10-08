import { z } from "zod";
import {
  AssetStatus,
  AssetCondition,
  UserRole,
  UserStatus,
  RequestPriority,
  MaintenanceType,
  MaintenanceStatus,
  DepreciationMethod,
} from "../enums";

/**
 * Formula injection prevention sanitizer.
 * Rejects strings starting with =, +, -, @ or neutralizes them.
 */
export const safeString = (max: number = 255) =>
  z.string()
    .trim()
    .max(max)
    .refine((val) => !/^[-+=@]/.test(val), {
      message: "Value must not start with spreadsheet formula symbols (=, +, -, @)",
    });

export const createAssetSchema = z.object({
  asset_tag: safeString(60).min(1, "Asset Tag is required"),
  name: safeString(120).min(2, "Asset Name is required"),
  category_id: safeString(20).min(1, "Category is required"),
  subcategory_id: safeString(20).optional().nullable(),
  brand: safeString(60).min(1, "Brand is required"),
  model: safeString(80).optional().nullable(),
  serial_number: safeString(100).min(1, "Serial Number is required"),
  description: safeString(500).optional().nullable(),
  condition: z.nativeEnum(AssetCondition).default(AssetCondition.NEW),
  location_id: safeString(20).min(1, "Location is required"),
  department_id: safeString(20).optional().nullable(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid purchase date format (YYYY-MM-DD)").optional().nullable(),
  purchase_cost: z.number().min(0, "Purchase cost cannot be negative").optional().nullable(),
  vendor_id: safeString(20).optional().nullable(),
  invoice_reference: safeString(60).optional().nullable(),
  warranty_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid warranty date format (YYYY-MM-DD)").optional().nullable(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const checkOutAssetSchema = z.object({
  asset_id: safeString(30).min(1, "Asset ID is required"),
  to_user_id: safeString(30).optional().nullable(),
  to_department_id: safeString(30).optional().nullable(),
  expected_return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
  notes: safeString(500).optional().nullable(),
}).refine((data) => data.to_user_id || data.to_department_id, {
  message: "Either a user or a department must be designated as the assignee",
});

export const checkInAssetSchema = z.object({
  asset_id: safeString(30).min(1, "Asset ID is required"),
  location_id: safeString(30).min(1, "Return Location is required"),
  return_condition: z.nativeEnum(AssetCondition),
  notes: safeString(500).optional().nullable(),
});

export const createMaintenanceSchema = z.object({
  asset_id: safeString(30).min(1, "Asset ID is required"),
  maintenance_type: z.nativeEnum(MaintenanceType),
  vendor_id: safeString(30).optional().nullable(),
  title: safeString(120).min(3, "Title must be at least 3 characters"),
  description: safeString(1000).min(5, "Description must be at least 5 characters"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD"),
  cost: z.number().min(0).optional().nullable(),
  performed_by: safeString(80).optional().nullable(),
  invoice_reference: safeString(60).optional().nullable(),
});

export const createRequestSchema = z.object({
  category_id: safeString(30).min(1, "Category is required"),
  department_id: safeString(30).min(1, "Department is required"),
  preferred_model: safeString(80).optional().nullable(),
  reason: safeString(500).min(5, "Reason must be at least 5 characters"),
  priority: z.nativeEnum(RequestPriority).default(RequestPriority.MEDIUM),
});

export const createUserSchema = z.object({
  email: z.string().email("Valid corporate email is required").trim().toLowerCase(),
  first_name: safeString(50).min(1, "First name is required"),
  last_name: safeString(50).min(1, "Last name is required"),
  role_id: z.nativeEnum(UserRole).default(UserRole.STAFF),
  department_id: safeString(30).optional().nullable(),
  job_title: safeString(80).optional().nullable(),
  phone: safeString(30).optional().nullable(),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
});

export const assetFilterSchema = z.object({
  search: z.string().optional(),
  category_id: z.string().optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  condition: z.nativeEnum(AssetCondition).optional(),
  department_id: z.string().optional(),
  location_id: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(5).max(100).default(20),
});

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type CheckOutAssetDTO = z.infer<typeof checkOutAssetSchema>;
export type CheckInAssetDTO = z.infer<typeof checkInAssetSchema>;
export type CreateMaintenanceDTO = z.infer<typeof createMaintenanceSchema>;
export type CreateRequestDTO = z.infer<typeof createRequestSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type AssetFilterCriteria = z.infer<typeof assetFilterSchema>;
