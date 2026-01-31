import { NextRequest, NextResponse } from "next/server";
import { TaxManagementService } from "@/lib/services/TaxManagementService";
import { verifyJWT } from "@/lib/auth/jwt";

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

    // Get tax jurisdictions
    const jurisdictions = await TaxManagementService.getTaxJurisdictions();

    return NextResponse.json({
      success: true,
      data: jurisdictions,
    });
  } catch (error) {
    console.error("Error fetching tax jurisdictions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tax jurisdictions",
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

    // Create tax jurisdiction
    const jurisdiction = await TaxManagementService.createTaxJurisdiction(body);

    return NextResponse.json({
      success: true,
      data: jurisdiction,
    });
  } catch (error) {
    console.error("Error creating tax jurisdiction:", error);
    return NextResponse.json(
      {
        error: "Failed to create tax jurisdiction",
      },
      { status: 500 },
    );
  }
}
