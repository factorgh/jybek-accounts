import { NextRequest, NextResponse } from "next/server";
import { AdvancedReportingService } from "@/lib/services/AdvancedReportingService";
import { verifyJwtToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          error: "startDate and endDate are required",
        },
        { status: 400 },
      );
    }

    const period = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    // Generate cash flow statement
    const cashFlowReport =
      await AdvancedReportingService.generateCashFlowStatement(
        decoded.businessId,
        period,
      );

    return NextResponse.json({
      success: true,
      data: cashFlowReport,
    });
  } catch (error) {
    console.error("Error generating cash flow report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate cash flow report",
      },
      { status: 500 },
    );
  }
}
