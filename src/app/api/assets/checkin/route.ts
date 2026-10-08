import { NextRequest, NextResponse } from "next/server";
import { assetService } from "@/services";
import { checkInAssetSchema } from "@/domain/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = checkInAssetSchema.parse(body);

    const actorUserId = "USR-000001"; // Ingested from session
    const updated = await assetService.checkIn(validated, actorUserId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Check-in failed";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CHECKIN_FAILED",
          message,
        },
      },
      { status: 400 }
    );
  }
}
