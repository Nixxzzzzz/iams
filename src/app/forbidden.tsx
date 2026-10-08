import React from 'react';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

/**
 * Next.js 16 403 Forbidden Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18, docs/USER_ROLES_AND_PERMISSIONS.md §2
 */

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <EmptyState
          icon={ShieldX}
          title="Access Restricted"
          description="You do not possess the required role capabilities to access this operational resource. Contact a Super Administrator for role assignment updates."
          action={
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
