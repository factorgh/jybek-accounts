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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customer = customers.find((c) => c.id === params.id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerData = await request.json();
    const customerIndex = customers.findIndex((c) => c.id === params.id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check if email already exists for another customer
    const existingCustomer = customers.find(
      (c) => c.email === customerData.email && c.id !== params.id,
    );
    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 },
      );
    }

    // Update customer
    const updatedCustomer = {
      ...customers[customerIndex],
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || customers[customerIndex].phone,
      address: customerData.address || customers[customerIndex].address,
      balance:
        customerData.balance !== undefined
          ? customerData.balance
          : customers[customerIndex].balance,
      status: customerData.status || customers[customerIndex].status,
      updatedAt: new Date().toISOString(),
    };

    customers[customerIndex] = updatedCustomer;

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerIndex = customers.findIndex((c) => c.id === params.id);

    if (customerIndex === -1) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Delete customer
    customers.splice(customerIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
