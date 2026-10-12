import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  GERRIT_BASE_URL: z.string().url().default('https://gerrit.wikimedia.org/r'),
  GERRIT_TIMEOUT_MS: z.coerce.number().default(15000),
  GERRIT_PAGE_LIMIT: z.coerce.number().default(100),
  GERRIT_MAX_PAGES: z.coerce.number().default(20),
  GERRIT_MAX_CONCURRENCY: z.coerce.number().default(5),
  REDIS_URL: z.string().optional().default(''),
  CACHE_TTL_SECONDS: z.coerce.number().default(14400), // 4 hours
  CACHE_MAX_MEMORY_ITEMS: z.coerce.number().default(1000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
  CORS_ORIGIN: z.string().default('*')
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
