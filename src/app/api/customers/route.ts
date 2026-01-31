import { NextRequest, NextResponse } from "next/server";

// Mock customer storage - in production, this would be in MongoDB
let customers: any[] = [
  {
    id: "1",
    name: "ABC Corporation",
    email: "billing@abccorp.com",
    phone: "+1-555-0101",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    balance: 5000,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 12,
    paidInvoices: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "XYZ Industries",
    email: "accounts@xyzindustries.com",
    phone: "+1-555-0102",
    address: "456 Industrial Blvd, Los Angeles, CA 90001",
    balance: 2500,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 8,
    paidInvoices: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // In production, you would verify JWT token here
    return NextResponse.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingCustomer = customers.find(
      (c) => c.email === customerData.email,
    );
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 },
      );
    }

    // Create new customer
    const newCustomer = {
      id: (customers.length + 1).toString(),
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || "",
      address: customerData.address || "",
      balance: 0,
      status: "active",
      businessId: "demo-business", // In production, get from JWT
      totalInvoices: 0,
      paidInvoices: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);

    return NextResponse.json({
      success: true,
      data: newCustomer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
