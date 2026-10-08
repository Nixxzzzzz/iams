import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/repositories";
import { assetService } from "@/services";
import { createAssetSchema, assetFilterSchema } from "@/domain/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const parsedFilters = assetFilterSchema.parse(queryParams);
    const result = await repositories.assetRepository.findMany(parsedFilters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ASSET_FETCH_ERROR",
          message,
        },
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAssetSchema.parse(body);

    // Mock actor user ID for initial scaffolding (replaced by session in auth phase)
    const actorUserId = "USR-000001";

    const created = await assetService.registerAsset(validated, actorUserId);

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Validation or registration error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ASSET_CREATION_FAILED",
          message,
        },
      },
      { status: 400 }
    );
  }
}
