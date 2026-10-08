import { AuthConfigRequiredError, AppError, ERROR_CODES } from '@/lib/errors/app-error';
import { getAuthConfigStatus } from '@/config/env';

/**
 * Authentication Domain & Policy Enforcement
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §5, docs/PROJECT_RULES.md §2.6
 *
 * CRITICAL FAIL-CLOSED INVARIANT:
 * If ALLOWED_EMAIL_DOMAINS is NOT_CONFIGURED, empty, or missing,
 * authentication MUST refuse access with AUTH_CONFIGURATION_REQUIRED.
 * Wildcard ('*') configurations are strictly rejected.
 */

export interface AuthPolicyCheckResult {
  allowed: boolean;
  reason?: string;
}

export function verifyEmailAgainstPolicy(
  email: string,
  configuredDomains?: string,
  configuredEmails?: string
): AuthPolicyCheckResult {
  const domainsConfig = (configuredDomains ?? process.env.ALLOWED_EMAIL_DOMAINS ?? '').trim();
  const emailsConfig = (configuredEmails ?? process.env.ALLOWED_EMAILS ?? '').trim();

  // 1. Fail closed if not configured
  const status = getAuthConfigStatus(domainsConfig);
  if (status === 'NOT_CONFIGURED') {
    throw new AuthConfigRequiredError(
      'Organization authentication policy is not configured. An administrator must configure allowed email domains.'
    );
  }

  // 2. Reject wildcard configurations
  if (status === 'INVALID') {
    throw new AppError(
      ERROR_CODES.CONFIGURATION_ERROR,
      'Invalid authentication domain policy configured. Wildcards and malformed domains are rejected.',
      500
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === normalizedEmail.length - 1) {
    return { allowed: false, reason: 'Malformed email address' };
  }

  const emailDomain = normalizedEmail.slice(atIndex + 1);

  // 3. Check allowed specific emails allowlist
  if (emailsConfig) {
    const allowedEmailList = emailsConfig
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (allowedEmailList.includes(normalizedEmail)) {
      return { allowed: true };
    }
  }

  // 4. Check domain allowlist
  const allowedDomainList = domainsConfig
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (allowedDomainList.includes(emailDomain)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Email domain '@${emailDomain}' is not permitted by organization security policy.`,
  };
}
