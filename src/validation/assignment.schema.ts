import { z } from 'zod';
import { CUSTODY_TYPES, ASSET_CONDITIONS, ASSET_STATUSES } from '@/domain/types/asset';
import { ASSIGNMENT_TYPES } from '@/domain/types/assignment';
import { ID_PREFIXES } from '@/config/constants';
import { idPattern, optionalSafeStringSchema, optionalDateStringSchema } from './common.schema';

/**
 * Assignment & Custody Validation Schemas
 * Source of Truth: docs/DATABASE_DESIGN.md §3.6, docs/ASSET_LIFECYCLE.md §3
 */

export const checkoutSchema = z
  .object({
    asset_id: idPattern(ID_PREFIXES.ASSET),
    custody_type: z.enum([CUSTODY_TYPES.USER, CUSTODY_TYPES.DEPARTMENT]),
    user_id: idPattern(ID_PREFIXES.USER).optional().nullable(),
    department_id: idPattern(ID_PREFIXES.DEPARTMENT).optional().nullable(),
    assignment_type: z.enum(Object.values(ASSIGNMENT_TYPES) as [string, ...string[]]),
    expected_return_at: optionalDateStringSchema,
    assigned_condition: z.enum(Object.values(ASSET_CONDITIONS) as [string, ...string[]]),
    notes: optionalSafeStringSchema(500),
  })
  .refine(
    (data) => {
      if (data.custody_type === CUSTODY_TYPES.USER && !data.user_id) {
        return false;
      }
      if (data.custody_type === CUSTODY_TYPES.DEPARTMENT && !data.department_id) {
        return false;
      }
      return true;
    },
    {
      message: 'Either user_id or department_id must be provided matching custody_type',
      path: ['user_id'],
    }
  )
  .refine(
    (data) => {
      if (data.assignment_type === ASSIGNMENT_TYPES.TEMPORARY && !data.expected_return_at) {
        return false;
      }
      return true;
    },
    {
      message: 'expected_return_at is required for TEMPORARY assignments',
      path: ['expected_return_at'],
    }
  );

export const checkinSchema = z
  .object({
    assignment_id: idPattern(ID_PREFIXES.ASSIGNMENT),
    returned_condition: z.enum(Object.values(ASSET_CONDITIONS) as [string, ...string[]]),
    next_status: z.enum([
      ASSET_STATUSES.AVAILABLE,
      ASSET_STATUSES.IN_MAINTENANCE,
      ASSET_STATUSES.DAMAGED,
      ASSET_STATUSES.PENDING_RETIREMENT,
    ]),
    return_location_id: idPattern(ID_PREFIXES.LOCATION),
    notes: optionalSafeStringSchema(500),
  })
  .refine(
    (data) => {
      if (
        (data.returned_condition === ASSET_CONDITIONS.DAMAGED ||
          data.returned_condition === ASSET_CONDITIONS.POOR) &&
        (!data.notes || data.notes.trim().length < 5)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Damage notes (minimum 5 characters) are mandatory when returned condition is POOR or DAMAGED',
      path: ['notes'],
    }
  );

export type CheckoutDTO = z.infer<typeof checkoutSchema>;
export type CheckinDTO = z.infer<typeof checkinSchema>;
