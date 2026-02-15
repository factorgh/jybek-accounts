import clientPromise from "@/lib/db/mongodb";
import bcrypt from "bcryptjs";

export async function seedAdminUser() {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Check if admin user already exists
    const existingAdmin = await db.collection("users").findOne({ 
      email: "admin@jybek.com" 
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return { success: true, message: "Admin user already exists" };
    }

    // Hash the admin password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const adminUser = {
      email: "admin@jybek.com",
      password: hashedPassword,
      role: "admin",
      businessId: "demo-business",
      firstName: "Admin",
      lastName: "User",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(adminUser);

    console.log("Admin user created successfully:", {
      id: result.insertedId,
      email: adminUser.email,
      role: adminUser.role,
    });

    return { 
      success: true, 
      message: "Admin user created successfully",
      userId: result.insertedId 
    };

  } catch (error) {
    console.error("Error seeding admin user:", error);
    return { 
      success: false, 
      error: "Failed to create admin user" 
    };
  }
}

export async function seedChartOfAccounts() {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Check if accounts already exist
    const existingAccounts = await db.collection("chart_of_accounts").countDocuments();
    if (existingAccounts > 0) {
      console.log("Chart of accounts already seeded");
      return { success: true, message: "Accounts already exist" };
    }

    // Sample chart of accounts data
    const accounts = [
      {
        code: "1001",
        name: "Cash Account",
        type: "asset",
        balance: 50000,
        isActive: true,
        description: "Main operating cash account",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "1002",
        name: "Accounts Receivable",
        type: "asset",
        balance: 25000,
        isActive: true,
        description: "Customer payments receivable",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "2001",
        name: "Accounts Payable",
        type: "liability",
        balance: 15000,
        isActive: true,
        description: "Supplier payments payable",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "3001",
        name: "Owner's Equity",
        type: "equity",
        balance: 60000,
        isActive: true,
        description: "Owner's initial investment",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "4001",
        name: "Service Revenue",
        type: "income",
        balance: 0,
        isActive: true,
        description: "Revenue from services",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: "5001",
        name: "Office Expenses",
        type: "expense",
        balance: 0,
        isActive: true,
        description: "Office operating expenses",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection("chart_of_accounts").insertMany(accounts);

    console.log("Chart of accounts seeded successfully:", {
      count: result.insertedCount,
      accounts: accounts.map(a => ({ code: a.code, name: a.name, type: a.type }))
    });

    return { 
      success: true, 
      message: "Chart of accounts seeded successfully",
      count: result.insertedCount 
    };

  } catch (error) {
    console.error("Error seeding chart of accounts:", error);
    return { 
      success: false, 
      error: "Failed to seed chart of accounts" 
    };
  }
}

export async function seedTransactions() {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Check if transactions already exist
    const existingTransactions = await db.collection("transactions").countDocuments();
    if (existingTransactions > 0) {
      console.log("Transactions already seeded");
      return { success: true, message: "Transactions already exist" };
    }

    // Sample transaction data
    const transactions = [
      {
        date: new Date("2024-01-15"),
        description: "Client payment for consulting services",
        amount: 5000,
        type: "income",
        category: "Service Revenue",
        accountCode: "4001",
        accountName: "Service Revenue",
        status: "completed",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: new Date("2024-01-20"),
        description: "Office rent payment",
        amount: 2000,
        type: "expense",
        category: "Office Expenses",
        accountCode: "5001",
        accountName: "Office Expenses",
        status: "completed",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        date: new Date("2024-01-25"),
        description: "Software subscription",
        amount: 500,
        type: "expense",
        category: "Office Expenses",
        accountCode: "5001",
        accountName: "Office Expenses",
        status: "completed",
        businessId: "demo-business",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await db.collection("transactions").insertMany(transactions);

    console.log("Transactions seeded successfully:", {
      count: result.insertedCount,
      total: transactions.reduce((sum, t) => sum + t.amount, 0)
    });

    return { 
      success: true, 
      message: "Transactions seeded successfully",
      count: result.insertedCount 
    };

  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { 
      success: false, 
      error: "Failed to seed transactions" 
    };
  }
}

// Main seeding function
export async function seedAllData() {
  console.log("Starting database seeding...");
  
  try {
    // Seed admin user
    const adminResult = await seedAdminUser();
    console.log("Admin user seeding:", adminResult);

    // Seed chart of accounts
    const accountsResult = await seedChartOfAccounts();
    console.log("Chart of accounts seeding:", accountsResult);

    // Seed transactions
    const transactionsResult = await seedTransactions();
    console.log("Transactions seeding:", transactionsResult);

    console.log("Database seeding completed successfully!");
    return {
      success: true,
      message: "All data seeded successfully",
      results: {
        admin: adminResult,
        accounts: accountsResult,
        transactions: transactionsResult,
      }
    };

  } catch (error) {
    console.error("Error during seeding:", error);
    return {
      success: false,
      error: "Failed to seed database",
    };
  }
}
