import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/InventoryService";
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

    // Get inventory items
    const items = await InventoryService.getInventoryItems(decoded.businessId);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch inventory items",
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

    // Create inventory item
    const item = await InventoryService.createInventoryItem(
      decoded.businessId,
      body,
    );

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      {
        error: "Failed to create inventory item",
      },
      { status: 500 },
    );
  }
}
