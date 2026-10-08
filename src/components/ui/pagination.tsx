'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  className,
  itemLabel = 'items',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 py-3 px-4 border-t border-slate-200 dark:border-gray-800 text-xs text-slate-600 dark:text-slate-400',
        className
      )}
    >
      {/* Range text */}
      <div className="flex items-center gap-2">
        <span>
          Showing <strong className="font-semibold text-slate-900 dark:text-slate-100">{startItem}</strong> to{' '}
          <strong className="font-semibold text-slate-900 dark:text-slate-100">{endItem}</strong> of{' '}
          <strong className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</strong> {itemLabel}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-900 dark:border-gray-700 dark:bg-gray-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            aria-label="First page"
            className="h-7 w-7 p-0"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <span className="px-2 font-medium text-slate-800 dark:text-slate-200">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
            aria-label="Next page"
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
            aria-label="Last page"
            className="h-7 w-7 p-0"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
