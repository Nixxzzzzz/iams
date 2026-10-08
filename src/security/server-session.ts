import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, SessionPayload, getSessionCookieOptions } from './session';
import { UserRole } from './roles';
import { Capability } from './capabilities';
import { hasCapability } from './permissions';
import { AuthenticationRequiredError, ForbiddenError } from '@/lib/errors/app-error';

/**
 * Server-Side Session & Identity Resolution DAL
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2.5
 *
 * SERVER-ONLY: Never import into Client Components.
 * Server-side authorization remains authoritative.
 */

export async function getServerSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const cookieOptions = getSessionCookieOptions();
    const token = cookieStore.get(cookieOptions.name)?.value;

    if (!token) {
      return null;
    }

    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireServerSession(redirectToLogin = true): Promise<SessionPayload> {
  const session = await getServerSession();

  if (!session) {
    if (redirectToLogin) {
      redirect('/login');
    }
    throw new AuthenticationRequiredError('Authentication required. No valid session token present.');
  }

  return session;
}

export async function requireRole(allowedRoles: readonly UserRole[]): Promise<SessionPayload> {
  const session = await requireServerSession(true);

  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError(
      `Access denied. Role '${session.role}' is not authorized for this resource.`
    );
  }

  return session;
}

export async function requireCapability(capability: Capability): Promise<SessionPayload> {
  const session = await requireServerSession(true);

  if (!hasCapability(session.role, capability)) {
    throw new ForbiddenError(
      `Access denied. Role '${session.role}' lacks capability '${capability}'.`
    );
  }

  return session;
}

export async function clearServerSession(): Promise<void> {
  const cookieStore = await cookies();
  const cookieOptions = getSessionCookieOptions();
  cookieStore.set(cookieOptions.name, '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });
}
