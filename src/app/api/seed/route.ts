import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed-data";

export async function POST(request: NextRequest) {
  try {
    const result = await seedDatabase();

    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error || null,
    });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database",
        error: error,
      },
      { status: 500 },
    );
  }
}
