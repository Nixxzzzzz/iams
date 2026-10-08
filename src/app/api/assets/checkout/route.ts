import { NextRequest, NextResponse } from "next/server";
import { assetService } from "@/services";
import { checkOutAssetSchema } from "@/domain/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkOutAssetSchema.parse(body);

    const actorUserId = "USR-000001"; // Ingested from session
    const updated = await assetService.checkOut(validated, actorUserId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHECKOUT_FAILED",
          message,
        },
      },
      { status: 400 }
    );
  }
}
