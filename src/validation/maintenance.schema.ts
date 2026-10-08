import { z } from 'zod';
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_PRIORITIES,
} from '@/domain/types/maintenance';
import { ASSET_CONDITIONS } from '@/domain/types/asset';
import { ID_PREFIXES } from '@/config/constants';
import { idPattern, safeStringSchema, optionalSafeStringSchema } from './common.schema';

/**
 * Maintenance & Service Ticket Validation Schemas
 * Source of Truth: docs/DATABASE_DESIGN.md §3.8
 */

export const createMaintenanceSchema = z.object({
  asset_id: idPattern(ID_PREFIXES.ASSET),
  maintenance_type: z.enum(Object.values(MAINTENANCE_TYPES) as [string, ...string[]]),
  issue: safeStringSchema(3, 150),
  description: optionalSafeStringSchema(1000),
  priority: z.enum(Object.values(MAINTENANCE_PRIORITIES) as [string, ...string[]]).default(MAINTENANCE_PRIORITIES.MEDIUM),
  vendor_id: idPattern(ID_PREFIXES.VENDOR).optional().nullable(),
  assigned_to: idPattern(ID_PREFIXES.USER).optional().nullable(),
  estimated_cost: z.coerce.number().min(0).optional().nullable(),
});

export const completeMaintenanceSchema = z.object({
  maintenance_id: idPattern(ID_PREFIXES.MAINTENANCE),
  resolution: safeStringSchema(5, 1000),
  actual_cost: z.coerce.number().min(0).optional().nullable(),
  next_condition: z.enum([ASSET_CONDITIONS.EXCELLENT, ASSET_CONDITIONS.GOOD, ASSET_CONDITIONS.FAIR]),
  return_location_id: idPattern(ID_PREFIXES.LOCATION),
  notes: optionalSafeStringSchema(500),
});

export type CreateMaintenanceDTO = z.infer<typeof createMaintenanceSchema>;
export type CompleteMaintenanceDTO = z.infer<typeof completeMaintenanceSchema>;
