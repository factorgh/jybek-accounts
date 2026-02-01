import { NextRequest, NextResponse } from "next/server";
import { AdvancedReportingService } from "@/lib/services/AdvancedReportingService";
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const asOfDate = searchParams.get("asOfDate");

    if (!asOfDate) {
      return NextResponse.json(
        {
          error: "asOfDate parameter is required",
        },
        { status: 400 },
      );
    }

    // Generate aged receivables report
    const agedReceivablesReport =
      await AdvancedReportingService.generateAgedReceivablesReport(
        decoded.businessId,
        new Date(asOfDate),
      );

    return NextResponse.json({
      success: true,
      data: agedReceivablesReport,
    });
  } catch (error) {
    console.error("Error generating aged receivables report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate aged receivables report",
      },
      { status: 500 },
    );
  }
}
