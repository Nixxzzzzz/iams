import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '@/domain/types/user';
import { ID_PREFIXES } from '@/config/constants';
import { idPattern, safeStringSchema, optionalSafeStringSchema } from './common.schema';

/**
 * User & Directory Validation Schemas
 * Source of Truth: docs/DATABASE_DESIGN.md §3.2
 */

export const createUserSchema = z.object({
  email: z.string().trim().email('Must be a valid email address').max(100),
  first_name: safeStringSchema(1, 50),
  last_name: safeStringSchema(1, 50),
  phone: optionalSafeStringSchema(20),
  role: z.enum(Object.values(USER_ROLES) as [string, ...string[]]).default(USER_ROLES.STAFF),
  department_id: idPattern(ID_PREFIXES.DEPARTMENT).optional().nullable(),
  job_title: optionalSafeStringSchema(80),
});

export const updateUserSchema = createUserSchema.partial().extend({
  status: z.enum(Object.values(USER_STATUSES) as [string, ...string[]]).optional(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
