import { NextRequest, NextResponse } from "next/server";

// Mock trial balance data - in production, this would be calculated from real transactions
const mockTrialBalance = [
  // Assets
  {
    accountCode: "1000",
    accountName: "Cash and Cash Equivalents",
    accountType: "asset",
    debitBalance: 25000,
    creditBalance: 0,
  },
  {
    accountCode: "1100",
    accountName: "Accounts Receivable",
    accountType: "asset",
    debitBalance: 15000,
    creditBalance: 0,
  },
  {
    accountCode: "1200",
    accountName: "Inventory",
    accountType: "asset",
    debitBalance: 10000,
    creditBalance: 0,
  },
  {
    accountCode: "1300",
    accountName: "Prepaid Expenses",
    accountType: "asset",
    debitBalance: 2000,
    creditBalance: 0,
  },
  {
    accountCode: "1400",
    accountName: "Fixed Assets",
    accountType: "asset",
    debitBalance: 50000,
    creditBalance: 0,
  },

  // Liabilities
  {
    accountCode: "2000",
    accountName: "Accounts Payable",
    accountType: "liability",
    debitBalance: 0,
    creditBalance: 8000,
  },
  {
    accountCode: "2100",
    accountName: "Short-term Loans",
    accountType: "liability",
    debitBalance: 0,
    creditBalance: 5000,
  },
  {
    accountCode: "2200",
    accountName: "Accrued Expenses",
    accountType: "liability",
    debitBalance: 0,
    creditBalance: 3000,
  },

  // Equity
  {
    accountCode: "3000",
    accountName: "Owner's Equity",
    accountType: "equity",
    debitBalance: 0,
    creditBalance: 50000,
  },
  {
    accountCode: "3100",
    accountName: "Retained Earnings",
    accountType: "equity",
    debitBalance: 0,
    creditBalance: 12000,
  },

  // Income
  {
    accountCode: "4000",
    accountName: "Sales Revenue",
    accountType: "income",
    debitBalance: 0,
    creditBalance: 75000,
  },
  {
    accountCode: "4100",
    accountName: "Service Revenue",
    accountType: "income",
    debitBalance: 0,
    creditBalance: 25000,
  },
  {
    accountCode: "4200",
    accountName: "Interest Income",
    accountType: "income",
    debitBalance: 0,
    creditBalance: 500,
  },

  // Expenses
  {
    accountCode: "5000",
    accountName: "Cost of Goods Sold",
    accountType: "expense",
    debitBalance: 30000,
    creditBalance: 0,
  },
  {
    accountCode: "5100",
    accountName: "Salaries and Wages",
    accountType: "expense",
    debitBalance: 20000,
    creditBalance: 0,
  },
  {
    accountCode: "5200",
    accountName: "Office Rent",
    accountType: "expense",
    debitBalance: 12000,
    creditBalance: 0,
  },
  {
    accountCode: "5300",
    accountName: "Marketing Expenses",
    accountType: "expense",
    debitBalance: 5000,
    creditBalance: 0,
  },
  {
    accountCode: "5400",
    accountName: "Utilities",
    accountType: "expense",
    debitBalance: 3000,
    creditBalance: 0,
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would verify JWT token here
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "current-month";

    // Calculate summary
    const totalDebits = mockTrialBalance.reduce(
      (sum, item) => sum + item.debitBalance,
      0,
    );
    const totalCredits = mockTrialBalance.reduce(
      (sum, item) => sum + item.creditBalance,
      0,
    );
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
        trialBalance: mockTrialBalance,
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
