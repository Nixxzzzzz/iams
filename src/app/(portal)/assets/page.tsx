import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shell/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssetFilterBar } from '@/components/assets/asset-filter-bar';
import { AssetTable } from '@/components/assets/asset-table';
import { ConfigurationRequiredBanner } from '@/components/assets/configuration-required-banner';
import { requireServerSession } from '@/security/server-session';
import { hasCapability } from '@/security/permissions';
import { CAPABILITIES } from '@/security/capabilities';
import { getAssetService } from '@/domain/services/asset-service';
import { isStorageConfigured } from '@/repositories/factory';
import { PackagePlus } from 'lucide-react';
import type { AssetStatus, AssetCondition } from '@/domain/types/asset';

interface AssetsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    condition?: string;
    category_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>;
}

export default async function AssetsPage(props: AssetsPageProps) {
  const session = await requireServerSession(true);
  const searchParams = await props.searchParams;

  const canCreate = hasCapability(session.role, CAPABILITIES.ASSETS_CREATE);
  const canEdit = hasCapability(session.role, CAPABILITIES.ASSETS_EDIT);
  const storageConfigured = isStorageConfigured();

  if (!storageConfigured) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Asset Inventory Master Registry"
          subtitle="Institutional Hardware & Technology Equipment Catalog"
          actionsSlot={
            <Badge variant="outline" className="font-mono text-xs">
              Role: {session.role}
            </Badge>
          }
        />
        <ConfigurationRequiredBanner />
      </div>
    );
  }

  const service = getAssetService();
  const filters = {
    page: searchParams.page ? Number(searchParams.page) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
    search: searchParams.search,
    status: (searchParams.status as AssetStatus) || undefined,
    condition: (searchParams.condition as AssetCondition) || undefined,
    category_id: searchParams.category_id,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  };

  const result = await service.listAssets(filters, {
    userId: session.userId,
    role: session.role,
    departmentId: session.departmentId,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Inventory Master Registry"
        subtitle="Institutional Hardware & Technology Equipment Catalog"
        actionsSlot={
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              Role: {session.role}
            </Badge>
            {canCreate && (
              <Link href="/assets/new">
                <Button variant="primary" size="md">
                  <PackagePlus className="h-4 w-4 mr-1.5" />
                  Register Asset
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <AssetFilterBar />

      {/* Primary Inventory Data Table */}
      <AssetTable
        assets={result.data}
        total={result.total}
        page={result.page}
        limit={result.limit}
        totalPages={result.totalPages}
        canEdit={canEdit}
      />
    </div>
  );
}
