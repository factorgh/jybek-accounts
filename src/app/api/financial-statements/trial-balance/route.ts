import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "current-month";

    // TODO: Implement real trial balance calculation from transactions and accounts
    // For now, return empty data
    const trialBalance: any[] = [];

    const totalDebits = 0;
    const totalCredits = 0;
    const isBalanced = totalDebits === totalCredits;
    const difference = Math.abs(totalDebits - totalCredits);

    const summary = {
      totalDebits,
      totalCredits,
      isBalanced,
      difference,
      asOfDate: new Date().toISOString().split("T")[0],
      period,
    };

    return NextResponse.json({
      success: true,
      data: {
        trialBalance,
        summary,
      },
    });
  } catch (error) {
    console.error("Error generating trial balance:", error);
    return NextResponse.json(
      { error: "Failed to generate trial balance" },
      { status: 500 },
    );
  }
}
