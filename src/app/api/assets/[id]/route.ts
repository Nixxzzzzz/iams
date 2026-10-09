import { NextRequest } from 'next/server';
import { getServerSession } from '@/security/server-session';
import { getAssetService } from '@/domain/services/asset-service';
import { jsonSuccess, jsonError } from '@/lib/errors/api-response';
import { AuthenticationRequiredError } from '@/lib/errors/app-error';

/**
 * Asset Detail & Mutation API Route Handler: /api/assets/[id]
 * Source of Truth: docs/ARCHITECTURE.md §2.2
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const { id } = await context.params;
    const service = getAssetService();
    const asset = await service.getAssetById(id, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });

    return jsonSuccess(asset);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const { id } = await context.params;
    const body = await request.json();
    const service = getAssetService();
    const updated = await service.updateAsset(id, body, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });

    return jsonSuccess(updated);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const { id } = await context.params;
    const { searchParams } = request.nextUrl;
    const reason = searchParams.get('reason') ?? 'Decommissioned by user';

    const service = getAssetService();
    const archived = await service.archiveAsset(id, reason, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });

    return jsonSuccess(archived);
  } catch (error) {
    return jsonError(error);
  }
}
