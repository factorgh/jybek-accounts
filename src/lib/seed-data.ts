import { Db, MongoClient } from "mongodb";
import clientPromise from "@/lib/db/mongodb";

export async function seedDatabase() {
  const client = await clientPromise;
  const db = client.db("jybek_accounts");

  try {
    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("businesses").deleteMany({});
    await db.collection("accounts").deleteMany({});
    await db.collection("transactions").deleteMany({});

    // Create admin user
    const adminUser = {
      email: "admin@jybek.com",
      name: "Admin User",
      businessId: "demo-business",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userResult = await db.collection("users").insertOne(adminUser);
    console.log("Admin user created:", userResult.insertedId);

    // Create demo business
    const business = {
      name: "Demo Business",
      email: "info@demobusiness.com",
      phone: "+1-555-0123",
      address: "123 Business St, Suite 100, Business City, BC 12345",
      fiscalYearStart: new Date("2024-01-01"),
      openingBalance: 50000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const businessResult = await db
      .collection("businesses")
      .insertOne(business);
    console.log("Demo business created:", businessResult.insertedId);

    // Create chart of accounts
    const accounts = [
      // Assets
      {
        businessId: "demo-business",
        code: "1000",
        name: "Cash and Cash Equivalents",
        type: "asset",
        isActive: true,
        balance: 25000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "1100",
        name: "Accounts Receivable",
        type: "asset",
        isActive: true,
        balance: 15000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "1200",
        name: "Inventory",
        type: "asset",
        isActive: true,
        balance: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "1300",
        name: "Fixed Assets",
        type: "asset",
        isActive: true,
        balance: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Liabilities
      {
        businessId: "demo-business",
        code: "2000",
        name: "Accounts Payable",
        type: "liability",
        isActive: true,
        balance: 8000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "2100",
        name: "Short-term Loans",
        type: "liability",
        isActive: true,
        balance: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Equity
      {
        businessId: "demo-business",
        code: "3000",
        name: "Owner's Equity",
        type: "equity",
        isActive: true,
        balance: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "3100",
        name: "Retained Earnings",
        type: "equity",
        isActive: true,
        balance: 12000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Revenue
      {
        businessId: "demo-business",
        code: "4000",
        name: "Sales Revenue",
        type: "income",
        isActive: true,
        balance: 75000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "4100",
        name: "Service Revenue",
        type: "income",
        isActive: true,
        balance: 25000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Expenses
      {
        businessId: "demo-business",
        code: "5000",
        name: "Cost of Goods Sold",
        type: "expense",
        isActive: true,
        balance: 30000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "5100",
        name: "Salaries and Wages",
        type: "expense",
        isActive: true,
        balance: 20000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "5200",
        name: "Office Rent",
        type: "expense",
        isActive: true,
        balance: 12000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        code: "5300",
        name: "Marketing Expenses",
        type: "expense",
        isActive: true,
        balance: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const accountResults = await db.collection("accounts").insertMany(accounts);
    console.log("Chart of accounts created:", accountResults.insertedIds);

    // Create sample transactions
    const transactions = [
      {
        businessId: "demo-business",
        transactionNumber: "TRX001",
        transactionDate: new Date("2024-01-15"),
        description: "Initial cash investment",
        reference: "INV001",
        type: "journal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        transactionNumber: "TRX002",
        transactionDate: new Date("2024-01-20"),
        description: "Office rent payment",
        reference: "RENT001",
        type: "expense",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        businessId: "demo-business",
        transactionNumber: "TRX003",
        transactionDate: new Date("2024-01-25"),
        description: "Client payment - ABC Corp",
        reference: "PAY001",
        type: "income",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const transactionResults = await db
      .collection("transactions")
      .insertMany(transactions);
    console.log("Sample transactions created:", transactionResults.insertedIds);

    // Create transaction lines (for double-entry)
    const insertedAccounts = await db
      .collection("accounts")
      .find({ businessId: "demo-business" })
      .toArray();
    const cashAccount = insertedAccounts.find((acc) => acc.code === "1000");
    const equityAccount = insertedAccounts.find((acc) => acc.code === "3000");
    const rentExpenseAccount = insertedAccounts.find(
      (acc) => acc.code === "5200",
    );
    const salesRevenueAccount = insertedAccounts.find(
      (acc) => acc.code === "4000",
    );

    if (
      !cashAccount ||
      !equityAccount ||
      !rentExpenseAccount ||
      !salesRevenueAccount
    ) {
      throw new Error(
        "Required accounts not found for seeding transaction lines",
      );
    }

    const transactionLines = [
      // TRX001 - Initial investment
      {
        transactionId: transactionResults.insertedIds["0"],
        accountId: cashAccount._id!, // Cash
        debitAmount: 50000,
        creditAmount: 0,
        description: "Initial cash investment",
        createdAt: new Date(),
      },
      {
        transactionId: transactionResults.insertedIds["0"],
        accountId: equityAccount._id!, // Owner's Equity
        debitAmount: 0,
        creditAmount: 50000,
        description: "Initial cash investment",
        createdAt: new Date(),
      },
      // TRX002 - Office rent
      {
        transactionId: transactionResults.insertedIds["1"],
        accountId: rentExpenseAccount._id!, // Office Rent Expense
        debitAmount: 1000,
        creditAmount: 0,
        description: "Office rent payment",
        createdAt: new Date(),
      },
      {
        transactionId: transactionResults.insertedIds["1"],
        accountId: cashAccount._id!, // Cash
        debitAmount: 0,
        creditAmount: 1000,
        description: "Office rent payment",
        createdAt: new Date(),
      },
      // TRX003 - Client payment
      {
        transactionId: transactionResults.insertedIds["2"],
        accountId: cashAccount._id!, // Cash
        debitAmount: 5000,
        creditAmount: 0,
        description: "Client payment - ABC Corp",
        createdAt: new Date(),
      },
      {
        transactionId: transactionResults.insertedIds["2"],
        accountId: salesRevenueAccount._id!, // Sales Revenue
        debitAmount: 0,
        creditAmount: 5000,
        description: "Client payment - ABC Corp",
        createdAt: new Date(),
      },
    ];

    const lineResults = await db
      .collection("transaction_lines")
      .insertMany(transactionLines);
    console.log("Transaction lines created:", lineResults.insertedIds);

    console.log("Database seeded successfully!");
    return {
      success: true,
      message: "Database seeded with demo data",
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      success: false,
      message: "Failed to seed database",
      error: error,
    };
  }
}

// Run seed function if called directly
if (require.main === module) {
  seedDatabase()
    .then((result) => {
      console.log("Seed result:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed error:", error);
      process.exit(1);
    });
}
