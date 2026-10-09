import React from 'react';
import { requireServerSession } from '@/security/server-session';
import { hasCapability } from '@/security/permissions';
import { CAPABILITIES } from '@/security/capabilities';
import { PageHeader } from '@/components/shell/page-header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AssetRegistrationForm } from '@/components/assets/asset-registration-form';
import Forbidden from '@/app/forbidden';

export default async function NewAssetPage() {
  const session = await requireServerSession(true);

  if (!hasCapability(session.role, CAPABILITIES.ASSETS_CREATE)) {
    return <Forbidden />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Inventory Assets', href: '/assets' },
          { label: 'Register New Asset' },
        ]}
      />

      <PageHeader
        title="Register New Inventory Asset"
        subtitle="Catalog organizational equipment into the master asset registry with automatic audit tracking"
      />

      <AssetRegistrationForm />
    </div>
  );
}
