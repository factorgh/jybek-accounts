import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const transactions = await db.collection("transactions").find({}).toArray();

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
    const client = await clientPromise;
    const db = client.db("jybek_accounts");
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
      ...transactionData,
      transactionNumber: `TRX${Date.now()}`,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("transactions")
      .insertOne(newTransaction);

    return NextResponse.json({
      success: true,
      data: { ...newTransaction, id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
