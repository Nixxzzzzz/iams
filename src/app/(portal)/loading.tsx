import React from 'react';
import { LoadingState } from '@/components/ui/loading-state';

/**
 * Portal Route Segment Loading Boundary
 * Source of Truth: docs/UI_UX_GUIDELINES.md §18
 * Renders neutral tabular skeleton loader with shimmer effect.
 */

export default function PortalLoading() {
  return (
    <div className="w-full space-y-4">
      <div className="h-6 w-48 rounded bg-slate-200 dark:bg-gray-800 animate-pulse" />
      <LoadingState rows={8} type="table" message="Loading records..." />
    </div>
  );
}
