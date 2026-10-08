'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';

/**
 * Portal Route Segment Error Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18
 */

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal Error caught:', error.message);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="Module Execution Error"
        message="Failed to load the operational module contents. You can attempt to reload the view."
        onRetry={reset}
      />
    </div>
  );
}
