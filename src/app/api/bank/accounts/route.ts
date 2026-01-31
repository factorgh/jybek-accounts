import { NextRequest, NextResponse } from "next/server";
import { BankReconciliationService } from "@/lib/services/BankReconciliationService";
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

    // Get bank accounts
    const accounts = await BankReconciliationService.getBankAccounts(
      decoded.businessId,
    );

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bank accounts",
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

    // Create bank account
    const account = await BankReconciliationService.createBankAccount(
      decoded.businessId,
      body,
    );

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error creating bank account:", error);
    return NextResponse.json(
      {
        error: "Failed to create bank account",
      },
      { status: 500 },
    );
  }
}
