import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireServerSession } from '@/security/server-session';
import { hasCapability } from '@/security/permissions';
import { CAPABILITIES } from '@/security/capabilities';
import { USER_ROLES } from '@/security/roles';
import { getAssetService } from '@/domain/services/asset-service';
import { AssetDossierHeader } from '@/components/asset-dossier/asset-dossier-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { AssetDetailTabs } from '@/components/assets/asset-detail-tabs';
import { Edit3 } from 'lucide-react';
import type { TransactionLedgerEntry } from '@/domain/types/transaction';

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  const session = await requireServerSession(true);
  const { id } = await params;

  const service = getAssetService();
  let asset;
  let transactions: TransactionLedgerEntry[] = [];

  try {
    asset = await service.getAssetById(id, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });
    transactions = await service.getAssetTransactions(id, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });
  } catch {
    notFound();
  }

  const canEdit = hasCapability(session.role, CAPABILITIES.ASSETS_EDIT);
  const isViewer = session.role === USER_ROLES.VIEWER;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Inventory Assets', href: '/assets' },
          { label: asset.asset_tag },
        ]}
      />

      {/* Asset Dossier Header */}
      <AssetDossierHeader
        data={{
          assetId: asset.asset_id,
          assetTag: asset.asset_tag,
          name: asset.name,
          status: asset.status,
          condition: asset.condition,
          categoryName: asset.category_id,
          brand: asset.brand,
          model: asset.model ?? undefined,
          serialNumber: asset.serial_number ?? undefined,
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canEdit && (
              <Link href={`/assets/${asset.asset_id}/edit`}>
                <Button variant="primary" size="sm">
                  <Edit3 className="h-4 w-4 mr-1.5" />
                  Edit Asset
                </Button>
              </Link>
            )}

            {/* Stage 5 & 7 Architectural Boundary Action Placeholders */}
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Custody checkout workflow authorizes in Stage 5"
            >
              Check Out (Stage 5)
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled
              title="Maintenance ticketing workflow authorizes in Stage 7"
            >
              Maintenance (Stage 7)
            </Button>
          </div>
        }
      />

      {/* Interactive Tabs */}
      <AssetDetailTabs
        asset={asset}
        transactions={transactions}
        isViewer={isViewer}
      />
    </div>
  );
}
