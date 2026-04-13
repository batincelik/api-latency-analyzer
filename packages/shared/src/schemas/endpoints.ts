import { z } from 'zod';

export const httpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

const headerPairSchema = z.object({
  key: z.string().min(1).max(256),
  value: z.string().max(8192),
});

export const createEndpointBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().max(2048),
  method: httpMethodSchema.default('GET'),
  timeoutMs: z.number().int().min(500).max(120_000).default(10_000),
  intervalSeconds: z.number().int().min(30).max(86_400).default(60),
  headers: z.array(headerPairSchema).max(50).default([]),
  body: z.string().max(100_000).optional().nullable(),
  expectedStatusCodes: z.array(z.number().int().min(100).max(599)).min(1).default([200]),
  enabled: z.boolean().default(true),
  tags: z.array(z.string().min(1).max(64)).max(32).default([]),
  alertRules: z
    .array(
      z.object({
        type: z.enum(['ENDPOINT_DOWN', 'REPEATED_FAILURES', 'LATENCY_THRESHOLD']),
        enabled: z.boolean().default(true),
        cooldownSeconds: z.number().int().min(30).max(86400).default(300),
        failureThreshold: z.number().int().min(1).max(20).optional(),
        latencyThresholdMs: z.number().int().min(50).max(600_000).optional(),
        webhookUrl: z.string().url().max(2048).optional().nullable(),
      }),
    )
    .max(10)
    .optional(),
});

export const updateEndpointBodySchema = createEndpointBodySchema.partial().extend({
  archived: z.boolean().optional(),
});

export const listEndpointsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().max(64).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  enabled: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  tag: z.string().max(64).optional(),
  q: z.string().max(200).optional(),
  includeArchived: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type CreateEndpointBody = z.infer<typeof createEndpointBodySchema>;
export type UpdateEndpointBody = z.infer<typeof updateEndpointBodySchema>;
