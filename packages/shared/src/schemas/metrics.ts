import { z } from 'zod';

export const metricsQuerySchema = z.object({
  window: z.enum(['1h', '24h', '7d', 'custom']).default('24h'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const listChecksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().max(64).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  success: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const listAlertsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().max(64).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['OPEN', 'RESOLVED']).optional(),
});

export type MetricsQuery = z.infer<typeof metricsQuerySchema>;
