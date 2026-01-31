import { NextRequest, NextResponse } from "next/server";

// Mock invoice storage - in production, this would be in MongoDB
let invoices: any[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    invoiceDate: "2024-01-15",
    dueDate: "2024-02-14",
    customerId: "1",
    customerName: "ABC Corporation",
    customerEmail: "billing@abccorp.com",
    status: "paid",
    subtotal: 5000,
    tax: 400,
    total: 5400,
    paidAmount: 5400,
    businessId: "demo-business",
    items: [
      {
        description: "Consulting Services",
        quantity: 40,
        unitPrice: 125,
        amount: 5000,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would verify JWT token here
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
      id: (invoices.length + 1).toString(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      invoiceDate:
        invoiceData.invoiceDate || new Date().toISOString().split("T")[0],
      dueDate:
        invoiceData.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      customerId: invoiceData.customerId || "",
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail || "",
      status: "draft",
      subtotal,
      tax,
      total,
      paidAmount: 0,
      businessId: "demo-business", // In production, get from JWT
      items: invoiceData.items,
      notes: invoiceData.notes || "",
      terms: invoiceData.terms || "Net 30",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    invoices.push(newInvoice);

    return NextResponse.json({
      success: true,
      data: newInvoice,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
