import React from 'react';
import { LoadingState } from '@/components/ui/loading-state';

/**
 * Root Application Loading Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18, Next.js File Conventions
 */

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-6">
      <LoadingState type="spinner" message="Loading operational workspace..." />
    </div>
  );
}
