import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log("API Route: GET request received for customers");

    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Get all customers from database
    const customers = await db
      .collection("customers")
      .find({})
      .sort({ name: 1 })
      .toArray();

    console.log(`API Route: Found ${customers.length} customers in database`);

    return NextResponse.json({
      success: true,
      data: customers.map((customer) => ({
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        balance: customer.balance || 0,
        status: customer.status || "active",
        businessId: customer.businessId,
        totalInvoices: customer.totalInvoices || 0,
        paidInvoices: customer.paidInvoices || 0,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      })),
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
    console.log("API Route: POST request received");
    const customerData = await request.json();
    console.log("API Route: Customer data received:", customerData);

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Check if email already exists
    const existingCustomer = await db.collection("customers").findOne({
      email: customerData.email,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 },
      );
    }

    // Create new customer
    const newCustomer = {
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone || "",
      address: customerData.address || "",
      balance: 0,
      status: customerData.status || "active",
      businessId: "demo-business", // In production, get from JWT
      totalInvoices: 0,
      paidInvoices: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("customers").insertOne(newCustomer);

    const createdCustomer = {
      id: result.insertedId.toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      balance: newCustomer.balance,
      status: newCustomer.status,
      businessId: newCustomer.businessId,
      totalInvoices: newCustomer.totalInvoices,
      paidInvoices: newCustomer.paidInvoices,
      createdAt: newCustomer.createdAt.toISOString(),
      updatedAt: newCustomer.updatedAt.toISOString(),
    };

    console.log("API Route: Customer created successfully:", createdCustomer);

    return NextResponse.json({
      success: true,
      data: createdCustomer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
