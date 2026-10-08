import React from 'react';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

/**
 * Root 404 Not Found Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18
 */

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <EmptyState
          icon={FileQuestion}
          title="Resource Not Found"
          description="The requested page or resource identifier does not exist within this operational portal."
          action={
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  );
}
