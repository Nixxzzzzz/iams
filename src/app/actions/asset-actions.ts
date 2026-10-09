'use server';

import { redirect } from 'next/navigation';
import { requireServerSession } from '@/security/server-session';
import { getAssetService } from '@/domain/services/asset-service';
import { CreateAssetDTO, UpdateAssetDTO } from '@/validation/asset.schema';

/**
 * Server Actions for Asset Mutations
 * Source of Truth: docs/ARCHITECTURE.md §2.2
 */

export async function createAssetAction(data: CreateAssetDTO) {
  const session = await requireServerSession(true);
  const service = getAssetService();

  const asset = await service.createAsset(data, {
    userId: session.userId,
    role: session.role,
    departmentId: session.departmentId,
  });

  redirect(`/assets/${asset.asset_id}`);
}

export async function updateAssetAction(assetId: string, data: UpdateAssetDTO) {
  const session = await requireServerSession(true);
  const service = getAssetService();

  const asset = await service.updateAsset(assetId, data, {
    userId: session.userId,
    role: session.role,
    departmentId: session.departmentId,
  });

  redirect(`/assets/${asset.asset_id}`);
}

export async function archiveAssetAction(assetId: string, reason: string) {
  const session = await requireServerSession(true);
  const service = getAssetService();

  await service.archiveAsset(assetId, reason, {
    userId: session.userId,
    role: session.role,
    departmentId: session.departmentId,
  });

  redirect('/assets');
}
