import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const invoices = await db.collection("invoices").find({}).toArray();

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");
    const invoiceData = await request.json();

    // Validate required fields
    if (
      !invoiceData.customerName ||
      !invoiceData.items ||
      invoiceData.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Customer name and items are required" },
        { status: 400 },
      );
    }

    // Calculate totals
    const subtotal = invoiceData.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;

    // Create new invoice
    const newInvoice = {
      ...invoiceData,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate:
        invoiceData.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate:
        invoiceData.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      status: "draft",
      subtotal,
      tax,
      total,
      paidAmount: 0,
      notes: invoiceData.notes || "",
      terms: invoiceData.terms || "Net 30",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("invoices").insertOne(newInvoice);

    return NextResponse.json({
      success: true,
      data: { ...newInvoice, id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
