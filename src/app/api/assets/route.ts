import { NextRequest } from 'next/server';
import { getServerSession } from '@/security/server-session';
import { getAssetService } from '@/domain/services/asset-service';
import { jsonSuccess, jsonError } from '@/lib/errors/api-response';
import { AuthenticationRequiredError } from '@/lib/errors/app-error';
import type { AssetStatus, AssetCondition, CustodyType } from '@/domain/types/asset';

/**
 * Assets API Route Handler: /api/assets
 * Source of Truth: docs/ARCHITECTURE.md §2.2
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const { searchParams } = request.nextUrl;
    const filters = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') ?? undefined,
      category_id: searchParams.get('category_id') ?? undefined,
      status: (searchParams.get('status') as AssetStatus) ?? undefined,
      condition: (searchParams.get('condition') as AssetCondition) ?? undefined,
      department_id: searchParams.get('department_id') ?? undefined,
      location_id: searchParams.get('location_id') ?? undefined,
      custody_type: (searchParams.get('custody_type') as CustodyType) ?? undefined,
      current_user_id: searchParams.get('current_user_id') ?? undefined,
    };

    const service = getAssetService();
    const result = await service.listAssets(filters, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });

    return jsonSuccess(result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      throw new AuthenticationRequiredError();
    }

    const body = await request.json();
    const service = getAssetService();
    const created = await service.createAsset(body, {
      userId: session.userId,
      role: session.role,
      departmentId: session.departmentId,
    });

    return jsonSuccess(created, undefined, 201);
  } catch (error) {
    return jsonError(error);
  }
}
