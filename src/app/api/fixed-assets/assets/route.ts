import { NextRequest, NextResponse } from "next/server";
import { FixedAssetsService } from "@/lib/services/FixedAssetsService";
import { verifyJWT } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get fixed assets
    const assets = await FixedAssetsService.getFixedAssets(decoded.businessId);

    return NextResponse.json({
      success: true,
      data: assets,
    });
  } catch (error) {
    console.error("Error fetching fixed assets:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch fixed assets",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();

    // Create fixed asset
    const asset = await FixedAssetsService.createFixedAsset(
      decoded.businessId,
      body,
    );

    return NextResponse.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    console.error("Error creating fixed asset:", error);
    return NextResponse.json(
      {
        error: "Failed to create fixed asset",
      },
      { status: 500 },
    );
  }
}
