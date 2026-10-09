'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Asset } from '@/domain/types/asset';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit3, Tag, Package } from 'lucide-react';

export interface AssetTableProps {
  assets: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  canEdit?: boolean;
}

export function AssetTable({
  assets,
  total,
  page,
  limit,
  totalPages,
  canEdit = false,
}: AssetTableProps) {
  const router = useRouter();

  const columns: ColumnDef<Asset>[] = [
    {
      id: 'asset_id',
      header: 'Asset ID',
      cell: (row) => (
        <Link
          href={`/assets/${row.asset_id}`}
          className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
        >
          {row.asset_id}
        </Link>
      ),
      width: '110px',
    },
    {
      id: 'asset_tag',
      header: 'Asset Tag',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-800 dark:text-slate-200">
          <Tag className="h-3 w-3 text-slate-400" />
          {row.asset_tag}
        </span>
      ),
      width: '130px',
    },
    {
      id: 'name',
      header: 'Asset Description',
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-900 dark:text-slate-100 text-xs">
            {row.name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {[row.brand, row.model].filter(Boolean).join(' • ')}
            {row.serial_number && ` (S/N: ${row.serial_number})`}
          </div>
        </div>
      ),
    },
    {
      id: 'category_id',
      header: 'Category',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {row.subcategory ? `${row.category_id} / ${row.subcategory}` : row.category_id}
        </span>
      ),
      width: '140px',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
      width: '120px',
    },
    {
      id: 'condition',
      header: 'Condition',
      cell: (row) => <ConditionBadge condition={row.condition} />,
      width: '110px',
    },
    {
      id: 'custody',
      header: 'Custody',
      cell: (row) => {
        if (row.custody_type === 'USER') {
          return (
            <Badge variant="secondary" className="text-[10px] font-mono">
              User: {row.current_user_id ?? 'Assigned'}
            </Badge>
          );
        }
        if (row.custody_type === 'DEPARTMENT') {
          return (
            <Badge variant="outline" className="text-[10px] font-mono">
              Dept: {row.department_id ?? 'Shared'}
            </Badge>
          );
        }
        return (
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            In Inventory Stock
          </span>
        );
      },
      width: '130px',
    },
    {
      id: 'location_id',
      header: 'Location',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
          {row.location_id ?? '—'}
        </span>
      ),
      width: '110px',
    },
    {
      id: 'purchase_date',
      header: 'Purchase Date',
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {row.purchase_date ?? '—'}
        </span>
      ),
      width: '110px',
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/assets/${row.asset_id}`}>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
          </Link>
          {canEdit && (
            <Link href={`/assets/${row.asset_id}/edit`}>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      ),
      width: '140px',
    },
  ];

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(newPage));
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <DataTable
      columns={columns}
      data={assets}
      keyExtractor={(row) => row.asset_id}
      emptyTitle="No Assets in Inventory"
      emptyDescription="No asset records matched your current query or filter criteria."
      emptyAction={
        canEdit ? (
          <Link href="/assets/new">
            <Button variant="primary" size="sm">
              <Package className="h-4 w-4 mr-1.5" />
              Register First Asset
            </Button>
          </Link>
        ) : undefined
      }
      pagination={
        total > 0
          ? {
              currentPage: page,
              totalPages,
              totalItems: total,
              pageSize: limit,
              onPageChange: handlePageChange,
            }
          : undefined
      }
    />
  );
}
