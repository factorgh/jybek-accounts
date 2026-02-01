import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

const defaultAccounts = [
  {
    code: "1000",
    name: "Cash and Cash Equivalents",
    type: "asset",
    balance: 25000,
    isActive: true,
    description: "Petty cash, checking accounts, and savings accounts",
    businessId: "demo-business",
  },
  {
    code: "1100",
    name: "Accounts Receivable",
    type: "asset",
    balance: 15000,
    isActive: true,
    description: "Money owed to the business by customers",
    businessId: "demo-business",
  },
  {
    code: "1200",
    name: "Inventory",
    type: "asset",
    balance: 30000,
    isActive: true,
    description: "Raw materials and finished goods",
    businessId: "demo-business",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    type: "liability",
    balance: 8000,
    isActive: true,
    description: "Money owed to suppliers and vendors",
    businessId: "demo-business",
  },
  {
    code: "2100",
    name: "Accrued Expenses",
    type: "liability",
    balance: 2000,
    isActive: true,
    description: "Expenses incurred but not yet paid",
    businessId: "demo-business",
  },
  {
    code: "3000",
    name: "Owner's Equity",
    type: "equity",
    balance: 50000,
    isActive: true,
    description: "Owner's investment in the business",
    businessId: "demo-business",
  },
  {
    code: "4000",
    name: "Sales Revenue",
    type: "income",
    balance: 0,
    isActive: true,
    description: "Revenue from primary business operations",
    businessId: "demo-business",
  },
  {
    code: "4100",
    name: "Service Revenue",
    type: "income",
    balance: 0,
    isActive: true,
    description: "Revenue from services provided",
    businessId: "demo-business",
  },
  {
    code: "5000",
    name: "Cost of Goods Sold",
    type: "expense",
    balance: 0,
    isActive: true,
    description: "Direct costs of producing goods",
    businessId: "demo-business",
  },
  {
    code: "5100",
    name: "Operating Expenses",
    type: "expense",
    balance: 0,
    isActive: true,
    description: "Day-to-day business expenses",
    businessId: "demo-business",
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log("Seeding chart of accounts...");
    
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Clear existing accounts
    await db.collection("chart_of_accounts").deleteMany({});
    
    // Insert default accounts with timestamps
    const accountsWithTimestamps = defaultAccounts.map(account => ({
      ...account,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.collection("chart_of_accounts").insertMany(accountsWithTimestamps);
    
    console.log(`Successfully seeded ${result.insertedCount} accounts`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.insertedCount} accounts`,
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Error seeding accounts:", error);
    return NextResponse.json(
      { error: "Failed to seed accounts" },
      { status: 500 },
    );
  }
}
