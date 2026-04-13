import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 14),
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  REQUEST_BODY_LIMIT: z.string().default('256kb'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  SCHEDULER_INTERVAL_MS: z.coerce.number().int().positive().default(15_000),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(10),
  CHECK_JOB_ATTEMPTS: z.coerce.number().int().min(1).max(5).default(3),
  CHECK_JOB_BACKOFF_MS: z.coerce.number().int().positive().default(2000),
  METRICS_RETENTION_DAYS: z.coerce.number().int().positive().default(90),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  OTEL_SERVICE_NAME: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function loadEnv(overrides?: Record<string, string | undefined>): AppEnv {
  if (cached && !overrides) return cached;
  const merged = { ...process.env, ...overrides };
  const parsed = envSchema.safeParse(merged);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }
  if (!overrides) cached = parsed.data;
  return parsed.data;
}

export function resetEnvCache(): void {
  cached = null;
}
