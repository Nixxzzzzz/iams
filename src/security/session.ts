import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from './roles';
import { AUTH_DEFAULTS } from '@/config/constants';
import { getEnv } from '@/config/env';

/**
 * Cryptographic Session Token & Cookie Abstraction
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2.5
 */

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  name: string;
}

function getSigningKey(): Uint8Array {
  const secret = getEnv().SESSION_SECRET;
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const key = getSigningKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_DEFAULTS.SESSION_MAX_AGE_SECONDS}s`)
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const key = getSigningKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      departmentId: (payload.departmentId as string | null) ?? null,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: AUTH_DEFAULTS.SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: AUTH_DEFAULTS.SESSION_MAX_AGE_SECONDS,
    path: '/',
  };
}
