import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

/**
 * Next.js 16 401 Unauthorized Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18, docs/USER_ROLES_AND_PERMISSIONS.md §5
 */

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <EmptyState
          icon={ShieldAlert}
          title="Authentication Required"
          description="Your session is expired or invalid. Please sign in through the organization identity provider to continue."
          action={
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In to Portal
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
