import { z } from 'zod';
import { AUTH_DEFAULTS } from './constants';

/**
 * Server Environment Variables Schema
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters in production').default('dev-session-secret-must-be-replaced-in-prod-with-32-chars'),
  // Allowed Google email domains (comma-separated). Default is NOT_CONFIGURED. Wildcard '*' is strictly prohibited.
  ALLOWED_EMAIL_DOMAINS: z.string().default(AUTH_DEFAULTS.ALLOWED_EMAIL_DOMAINS_NOT_CONFIGURED),
  // Optional allowed specific emails (comma-separated)
  ALLOWED_EMAILS: z.string().default(''),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.format();
    throw new Error(`Environment validation failed: ${JSON.stringify(errorDetails)}`);
  }

  parsedEnv = result.data;
  return parsedEnv;
}

export type AuthConfigStatus = 'CONFIGURED' | 'NOT_CONFIGURED' | 'INVALID';

/**
 * Validates domain security configuration state.
 * Refuses open or wildcard access.
 */
export function getAuthConfigStatus(allowedDomainsInput?: string): AuthConfigStatus {
  const domainsStr = (allowedDomainsInput ?? getEnv().ALLOWED_EMAIL_DOMAINS).trim();

  if (!domainsStr || domainsStr === AUTH_DEFAULTS.ALLOWED_EMAIL_DOMAINS_NOT_CONFIGURED) {
    return 'NOT_CONFIGURED';
  }

  // Wildcard is strictly forbidden
  if (domainsStr === '*' || domainsStr.includes('*')) {
    return 'INVALID';
  }

  const domainList = domainsStr.split(',').map((d) => d.trim()).filter(Boolean);
  if (domainList.length === 0) {
    return 'NOT_CONFIGURED';
  }

  // Validate that each entry looks like a valid hostname/domain
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
  for (const domain of domainList) {
    if (!domainRegex.test(domain)) {
      return 'INVALID';
    }
  }

  return 'CONFIGURED';
}
