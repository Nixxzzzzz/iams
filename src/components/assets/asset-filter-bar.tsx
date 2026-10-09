'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ASSET_STATUSES } from '@/domain/types/asset';
import { ASSET_CONDITIONS } from '@/domain/types/asset';
import { Search, RotateCcw, ArrowUpDown, Filter } from 'lucide-react';

export function AssetFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get('search') ?? '';
  const currentStatus = searchParams.get('status') ?? '';
  const currentCondition = searchParams.get('condition') ?? '';
  const currentSortBy = searchParams.get('sortBy') ?? 'created_at';
  const currentSortOrder = searchParams.get('sortOrder') ?? 'desc';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter change

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm.trim() || null });
  };

  const handleReset = () => {
    setSearchTerm('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(
    currentSearch || currentStatus || currentCondition || (currentSortBy !== 'created_at')
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-3">
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by asset tag, name, serial number, brand, or model..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <Button type="submit" variant="secondary" isLoading={isPending} className="shrink-0">
          Search
        </Button>
      </form>

      {/* Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Status Dropdown */}
        <div className="w-44">
          <Select
            value={currentStatus}
            onChange={(e) => updateFilters({ status: e.target.value || null })}
            options={[
              { value: '', label: 'All Statuses' },
              ...Object.values(ASSET_STATUSES).map((status) => ({
                value: status,
                label: status.replace(/_/g, ' '),
              })),
            ]}
          />
        </div>

        {/* Condition Dropdown */}
        <div className="w-40">
          <Select
            value={currentCondition}
            onChange={(e) => updateFilters({ condition: e.target.value || null })}
            options={[
              { value: '', label: 'All Conditions' },
              ...Object.values(ASSET_CONDITIONS).map((condition) => ({
                value: condition,
                label: condition,
              })),
            ]}
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort:
          </span>
          <div className="w-36">
            <Select
              value={currentSortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
              options={[
                { value: 'created_at', label: 'Date Registered' },
                { value: 'asset_id', label: 'Asset ID' },
                { value: 'asset_tag', label: 'Asset Tag' },
                { value: 'name', label: 'Asset Name' },
                { value: 'purchase_date', label: 'Purchase Date' },
                { value: 'status', label: 'Status' },
              ]}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => updateFilters({ sortOrder: currentSortOrder === 'asc' ? 'desc' : 'asc' })}
            title="Toggle sort direction"
            className="text-xs font-mono px-2"
          >
            {currentSortOrder.toUpperCase()}
          </Button>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
