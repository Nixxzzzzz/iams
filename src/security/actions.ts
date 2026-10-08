'use server';

import { redirect } from 'next/navigation';
import { clearServerSession } from './server-session';

/**
 * Server Actions for Authentication Boundary
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2.5
 *
 * Implements logout and session invalidation boundaries on the server.
 */

export async function logoutAction(): Promise<void> {
  await clearServerSession();
  redirect('/login');
}
