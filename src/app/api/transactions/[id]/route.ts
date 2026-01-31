import { NextRequest, NextResponse } from "next/server";

// Mock transaction storage - in production, this would be in MongoDB
let transactions: any[] = [
  {
    id: "1",
    transactionNumber: "TRX001",
    transactionDate: "2024-01-15",
    description: "Office supplies purchase",
    reference: "INV-2024-001",
    type: "expense",
    totalAmount: 250.0,
    status: "posted",
    businessId: "demo-business",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    transactionNumber: "TRX002",
    transactionDate: "2024-01-20",
    description: "Client payment received",
    reference: "PAY-2024-001",
    type: "receipt",
    totalAmount: 1500.0,
    status: "posted",
    businessId: "demo-business",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    transactionNumber: "TRX003",
    transactionDate: "2024-01-25",
    description: "Software subscription",
    reference: null,
    type: "expense",
    totalAmount: 99.99,
    status: "draft",
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
    const transaction = transactions.find((t) => t.id === params.id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const transactionData = await request.json();
    const transactionIndex = transactions.findIndex((t) => t.id === params.id);

    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // Update transaction
    const updatedTransaction = {
      ...transactions[transactionIndex],
      ...transactionData,
      updatedAt: new Date().toISOString(),
    };

    transactions[transactionIndex] = updatedTransaction;

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const transactionIndex = transactions.findIndex((t) => t.id === params.id);

    if (transactionIndex === -1) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    // Delete transaction
    transactions.splice(transactionIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
