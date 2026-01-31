import { NextRequest, NextResponse } from "next/server";

// Mock account storage - in production, this would be in MongoDB
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const account = accounts.find((a) => a.id === params.id);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const accountData = await request.json();
    const accountIndex = accounts.findIndex((a) => a.id === params.id);

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Validate required fields
    if (!accountData.code || !accountData.name || !accountData.type) {
      return NextResponse.json(
        { error: "Code, name, and type are required" },
        { status: 400 },
      );
    }

    // Check if code already exists for another account
    const existingAccount = accounts.find(
      (a) => a.code === accountData.code && a.id !== params.id,
    );
    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this code already exists" },
        { status: 400 },
      );
    }

    // Update account
    const updatedAccount = {
      ...accounts[accountIndex],
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      description:
        accountData.description || accounts[accountIndex].description,
      parentCode: accountData.parentCode || accounts[accountIndex].parentCode,
      balance:
        accountData.balance !== undefined
          ? accountData.balance
          : accounts[accountIndex].balance,
      isActive:
        accountData.isActive !== undefined
          ? accountData.isActive
          : accounts[accountIndex].isActive,
      updatedAt: new Date().toISOString(),
    };

    accounts[accountIndex] = updatedAccount;

    return NextResponse.json({
      success: true,
      data: updatedAccount,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const accountIndex = accounts.findIndex((a) => a.id === params.id);

    if (accountIndex === -1) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Delete account
    accounts.splice(accountIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
