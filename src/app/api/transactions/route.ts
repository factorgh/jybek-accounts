import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

// Mock transaction storage - in production, this would be in MongoDB
let transactions: any[] = [
  {
    id: "1",
    transactionNumber: "TRX001",
    transactionDate: "2024-01-15",
    description: "Initial cash investment",
    reference: "INV001",
    type: "journal",
    businessId: "demo-business",
    totalAmount: 50000,
    status: "posted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    transactionNumber: "TRX002",
    transactionDate: "2024-01-20",
    description: "Office rent payment",
    reference: "RENT001",
    type: "expense",
    businessId: "demo-business",
    totalAmount: 1000,
    status: "posted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would verify JWT token here
    // const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    // const decoded = verifyJWT(token)

    // For now, return all transactions
    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();

    // Validate required fields
    if (!transactionData.description || !transactionData.transactionDate) {
      return NextResponse.json(
        { error: "Description and transaction date are required" },
        { status: 400 },
      );
    }

    // Create new transaction
    const newTransaction = {
      id: (transactions.length + 1).toString(),
      transactionNumber: `TRX${String(transactions.length + 1).padStart(3, "0")}`,
      transactionDate: transactionData.transactionDate,
      description: transactionData.description,
      reference: transactionData.reference || "",
      type: transactionData.type || "journal",
      businessId: "demo-business", // In production, get from JWT
      totalAmount: transactionData.totalAmount || 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    transactions.push(newTransaction);

    return NextResponse.json({
      success: true,
      data: newTransaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
