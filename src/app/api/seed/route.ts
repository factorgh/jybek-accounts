import { NextRequest, NextResponse } from "next/server";
import { seedAllData } from "@/lib/seed-data";

export async function POST(request: NextRequest) {
  try {
    console.log("Seeding API called");
    
    const result = await seedAllData();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Database seeded successfully",
        data: result.results,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Failed to seed database",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error during seeding",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Seeding endpoint ready. Use POST to seed the database.",
      availableEndpoints: {
        admin: "POST /api/seed - Seeds all data (admin user, accounts, transactions)",
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to access seeding endpoint",
    }, { status: 500 });
  }
}
