'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';

/**
 * Root Application Error Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18, docs/PROJECT_RULES.md §4.5
 *
 * Catches unhandled errors without leaking stack traces, secrets, or internal paths.
 */

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Operational error logging (scrubbed of secrets)
    console.error('Application Error caught by root boundary:', error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-6">
      <div className="w-full max-w-md">
        <ErrorState
          title="Operational Workspace Error"
          message="An unexpected system condition occurred while rendering this interface. Please retry or contact technical operations if the issue persists."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
