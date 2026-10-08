import { z } from 'zod';
import { PAGINATION } from '@/config/constants';
import { sanitizeForSpreadsheet } from '@/lib/utils/sanitize';

/**
 * Common Zod Validation Schemas
 * Source of Truth: docs/ARCHITECTURE.md §2.2, docs/PROJECT_RULES.md §4.3
 */

export const idPattern = (prefix: string) =>
  z.string().regex(new RegExp(`^${prefix}[0-9]{6}$`), `Invalid identifier format. Must match ${prefix}000000`);

export const safeStringSchema = (min = 1, max = 255) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must not exceed ${max} characters`)
    .transform(sanitizeForSpreadsheet);

export const optionalSafeStringSchema = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max, `Must not exceed ${max} characters`)
    .optional()
    .nullable()
    .transform((val) => (val ? sanitizeForSpreadsheet(val) : null));

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date in YYYY-MM-DD format')
  .or(z.string().datetime({ message: 'Must be a valid ISO-8601 datetime string' }));

export const optionalDateStringSchema = dateStringSchema.optional().nullable();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_PAGE_SIZE)
    .default(PAGINATION.DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(100).optional(),
  sortBy: z.string().trim().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
