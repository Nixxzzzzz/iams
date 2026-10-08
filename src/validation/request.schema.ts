import { z } from 'zod';
import { REQUEST_PRIORITIES } from '@/domain/types/request';
import { ID_PREFIXES } from '@/config/constants';
import { idPattern, safeStringSchema, optionalSafeStringSchema } from './common.schema';

/**
 * Requisition Request Validation Schemas
 * Source of Truth: docs/DATABASE_DESIGN.md §3.9, docs/USER_ROLES_AND_PERMISSIONS.md §5
 */

export const createRequestSchema = z.object({
  category_id: idPattern(ID_PREFIXES.CATEGORY),
  requested_asset_id: idPattern(ID_PREFIXES.ASSET).optional().nullable(),
  reason: safeStringSchema(5, 500),
  priority: z.enum(Object.values(REQUEST_PRIORITIES) as [string, ...string[]]).default(REQUEST_PRIORITIES.MEDIUM),
});

export const rejectRequestSchema = z.object({
  request_id: idPattern(ID_PREFIXES.REQUEST),
  rejection_reason: safeStringSchema(5, 500), // Mandatory rejection reason!
});

export const approveRequestSchema = z.object({
  request_id: idPattern(ID_PREFIXES.REQUEST),
  notes: optionalSafeStringSchema(500),
});

export const fulfillRequestSchema = z.object({
  request_id: idPattern(ID_PREFIXES.REQUEST),
  fulfilled_asset_id: idPattern(ID_PREFIXES.ASSET),
  notes: optionalSafeStringSchema(500),
});

export type CreateRequestDTO = z.infer<typeof createRequestSchema>;
export type RejectRequestDTO = z.infer<typeof rejectRequestSchema>;
export type ApproveRequestDTO = z.infer<typeof approveRequestSchema>;
export type FulfillRequestDTO = z.infer<typeof fulfillRequestSchema>;
