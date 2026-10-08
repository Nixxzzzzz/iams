import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/repositories";
import { assetService } from "@/services";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await repositories.assetRepository.findById(id);

    if (!asset) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ASSET_NOT_FOUND",
            message: `Asset with ID '${id}' was not found.`,
          },
        },
        { status: 404 }
      );
    }

    const history = await assetService.getAssetHistory(id);

    return NextResponse.json({
      success: true,
      data: {
        asset,
        history,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ASSET_FETCH_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
