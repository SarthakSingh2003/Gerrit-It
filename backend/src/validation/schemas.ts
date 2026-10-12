import { z } from 'zod';

export const identifierParamSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Contributor identifier is required')
    .max(128, 'Contributor identifier too long')
    .regex(/^[a-zA-Z0-9_\-@.+ ]+$/, 'Invalid contributor identifier characters')
});

export const dateQuerySchema = z.object({
  preset: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be formatted YYYY-MM-DD')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be formatted YYYY-MM-DD')
    .optional()
});

export const reportQuerySchema = dateQuerySchema.extend({
  format: z.enum(['json', 'markdown']).default('json'),
  includeRepositories: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  maxRepositories: z.coerce.number().min(1).max(100).default(15)
});

export const changesQuerySchema = dateQuerySchema.extend({
  type: z.enum(['authored', 'reviewed']).default('authored'),
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0)
});

export const cohortBodySchema = z.object({
  identifiers: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(128)
        .regex(/^[a-zA-Z0-9_\-@.+ ]+$/)
    )
    .min(1, 'At least one contributor identifier is required')
    .max(20, 'Maximum 20 contributors allowed per cohort analysis batch'),
  preset: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
