import React from 'react';
import { notFound } from 'next/navigation';
import { requireServerSession } from '@/security/server-session';
import { hasCapability } from '@/security/permissions';
import { CAPABILITIES } from '@/security/capabilities';
import { getAssetService } from '@/domain/services/asset-service';
import { PageHeader } from '@/components/shell/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AssetEditForm } from '@/components/assets/asset-edit-form';
import Forbidden from '@/app/forbidden';

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const session = await requireServerSession(true);
  const { id } = await params;

  if (!hasCapability(session.role, CAPABILITIES.ASSETS_EDIT)) {
    return <Forbidden />;
  }

  const service = getAssetService();
  let asset;

  try {
    asset = await service.getAssetById(id, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Inventory Assets', href: '/assets' },
          { label: asset.asset_tag, href: `/assets/${asset.asset_id}` },
          { label: 'Edit Asset' },
        ]}
      />

      <PageHeader
        title={`Edit Asset ${asset.asset_tag}`}
        subtitle={`Update attributes for ${asset.name} (${asset.asset_id})`}
      />

      <AssetEditForm asset={asset} />
    </div>
  );
}
