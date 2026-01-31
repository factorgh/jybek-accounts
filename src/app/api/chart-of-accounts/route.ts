import { NextRequest, NextResponse } from "next/server";

// Mock accounts storage - in production, this would be in MongoDB
let accounts: any[] = [
  {
    id: "1",
    code: "1000",
    name: "Cash and Cash Equivalents",
    type: "asset",
    balance: 25000,
    isActive: true,
    description: "Petty cash, checking accounts, and savings accounts",
    businessId: "demo-business",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "1100",
    name: "Accounts Receivable",
    type: "asset",
    balance: 15000,
    isActive: true,
    description: "Money owed to the business by customers",
    businessId: "demo-business",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    code: "2000",
    name: "Accounts Payable",
    type: "liability",
    balance: 8000,
    isActive: true,
    description: "Money owed to suppliers and vendors",
    businessId: "demo-business",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would verify JWT token here
    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accountData = await request.json();

    // Validate required fields
    if (!accountData.code || !accountData.name || !accountData.type) {
      return NextResponse.json(
        { error: "Account code, name, and type are required" },
        { status: 400 },
      );
    }

    // Check if account code already exists
    const existingAccount = accounts.find((a) => a.code === accountData.code);
    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this code already exists" },
        { status: 400 },
      );
    }

    // Create new account
    const newAccount = {
      id: (accounts.length + 1).toString(),
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      balance: accountData.openingBalance || 0,
      isActive: accountData.isActive !== false,
      description: accountData.description || "",
      businessId: "demo-business", // In production, get from JWT
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accounts.push(newAccount);

    return NextResponse.json({
      success: true,
      data: newAccount,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
