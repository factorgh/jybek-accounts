import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/jwt";
import { LedgerService } from "@/lib/services/LedgerService";
import { AccountService } from "@/lib/models/Account";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const apiKey = request.headers.get("X-API-Key");

    let businessId: string;

    if (authHeader?.startsWith("Bearer ")) {
      // JWT Authentication
      const token = authHeader.substring(7);
      const payload = AuthService.verifyToken(token);
      businessId = payload.businessId;
    } else if (apiKey) {
      // API Key Authentication
      const db = await import("@/lib/db/mongodb")
        .then((m) => m.default)
        .then((client) => client.db("jybek_accounts"));
      const apiClient = await db
        .collection("apiClients")
        .findOne({ apiKey, isActive: true });

      if (!apiClient) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      businessId = apiClient.businessId;
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const {
      incomeAccountId,
      cashAccountId,
      amount,
      transactionDate,
      description,
      reference,
    } = await request.json();

    if (
      !incomeAccountId ||
      !cashAccountId ||
      !amount ||
      !transactionDate ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate accounts
    const incomeAccount = await AccountService.getAccountById(incomeAccountId);
    const cashAccount = await AccountService.getAccountById(cashAccountId);

    if (!incomeAccount || incomeAccount.businessId !== businessId) {
      return NextResponse.json(
        { error: "Invalid income account" },
        { status: 400 },
      );
    }

    if (!cashAccount || cashAccount.businessId !== businessId) {
      return NextResponse.json(
        { error: "Invalid cash account" },
        { status: 400 },
      );
    }

    // Create income transaction
    const transaction = await LedgerService.postIncome(
      businessId,
      incomeAccountId,
      cashAccountId,
      amount,
      new Date(transactionDate),
      description,
      reference,
    );

    return NextResponse.json({
      transactionId: transaction._id,
      transactionNumber: transaction.transactionNumber,
      message: "Income transaction created successfully",
    });
  } catch (error) {
    console.error("Income transaction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
