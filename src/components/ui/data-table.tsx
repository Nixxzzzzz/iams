'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from './checkbox';
import { Pagination, PaginationProps } from './pagination';
import { EmptyState } from './empty-state';
import { Skeleton } from './loading-state';

export interface ColumnDef<T> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  // Selection
  isSelectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  // Sorting
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc' | null;
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  // Row Click
  onRowClick?: (row: T) => void;
  // Pagination
  pagination?: Omit<PaginationProps, 'className'>;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is currently no data to display.',
  emptyAction,
  isSelectable = false,
  selectedIds = [],
  onSelectChange,
  sortColumn,
  sortDirection,
  onSortChange,
  onRowClick,
  pagination,
  className,
}: DataTableProps<T>) {
  const allRowKeys = data.map(keyExtractor);
  const isAllSelected =
    data.length > 0 && allRowKeys.every((key) => selectedIds.includes(key));
  const isPartiallySelected =
    selectedIds.length > 0 && !isAllSelected && allRowKeys.some((k) => selectedIds.includes(k));

  const handleSelectAll = () => {
    if (!onSelectChange) return;
    if (isAllSelected) {
      onSelectChange(selectedIds.filter((id) => !allRowKeys.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedIds, ...allRowKeys]));
      onSelectChange(merged);
    }
  };

  const handleRowSelect = (key: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!onSelectChange) return;
    if (selectedIds.includes(key)) {
      onSelectChange(selectedIds.filter((id) => id !== key));
    } else {
      onSelectChange([...selectedIds, key]);
    }
  };

  const handleHeaderSort = (column: ColumnDef<T>) => {
    if (!column.sortable || !onSortChange) return;
    const isCurrent = sortColumn === column.id;
    if (!isCurrent || sortDirection === null) {
      onSortChange(column.id, 'asc');
    } else if (sortDirection === 'asc') {
      onSortChange(column.id, 'desc');
    } else {
      onSortChange(column.id, 'asc');
    }
  };

  return (
    <div
      className={cn(
        'rounded-md border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden flex flex-col',
        className
      )}
    >
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-gray-800/80 border-b border-slate-200 dark:border-gray-800 select-none">
            <tr className="h-9">
              {isSelectable && (
                <th className="w-10 px-3 text-center align-middle">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isPartiallySelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortColumn === col.id;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';

                return (
                  <th
                    key={col.id}
                    scope="col"
                    style={{ width: col.width }}
                    className={cn(
                      'px-3.5 font-semibold text-slate-700 dark:text-slate-300 tracking-wider uppercase text-[11px] align-middle',
                      alignClass,
                      col.sortable &&
                        'cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors',
                      col.className
                    )}
                    onClick={() => handleHeaderSort(col)}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'right' && 'flex-row-reverse'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted && sortDirection === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                          ) : isSorted && sortDirection === 'desc' ? (
                            <ArrowDown className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loading-row-${rIdx}`} className="h-10">
                  {isSelectable && (
                    <td className="px-3 text-center align-middle">
                      <Skeleton className="h-4 w-4 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={`loading-col-${col.id}`} className="px-3.5 align-middle">
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td
                  colSpan={columns.length + (isSelectable ? 1 : 0)}
                  className="py-10 text-center"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, index) => {
                const key = keyExtractor(row);
                const isSelected = selectedIds.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'h-10 transition-colors',
                      'hover:bg-slate-50/80 dark:hover:bg-zinc-800/50',
                      isSelected && 'bg-sky-50/60 dark:bg-sky-950/30',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {isSelectable && (
                      <td
                        className="w-10 px-3 text-center align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleRowSelect(key, e as unknown as React.MouseEvent)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left';

                      let content: React.ReactNode = null;
                      if (col.cell) {
                        content = col.cell(row, index);
                      } else if (col.accessorKey) {
                        content = String(row[col.accessorKey] ?? '');
                      }

                      return (
                        <td
                          key={col.id}
                          className={cn(
                            'px-3.5 align-middle text-slate-800 dark:text-slate-200 tabular-nums',
                            alignClass,
                            col.className
                          )}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !isLoading && data.length > 0 && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}
