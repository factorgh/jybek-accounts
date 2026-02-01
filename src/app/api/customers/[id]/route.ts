import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");
    const customer = await db.collection("customers").findOne({
      _id: new ObjectId(params.id),
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
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
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Validate required fields
    if (!customerData.name || !customerData.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    // Check if email already exists for another customer
    const existingCustomer = await db.collection("customers").findOne({
      email: customerData.email,
      _id: { $ne: new ObjectId(params.id) },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email already exists" },
        { status: 400 },
      );
    }

    // Update customer
    const result = await db.collection("customers").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || "",
          address: customerData.address || "",
          balance:
            customerData.balance !== undefined ? customerData.balance : 0,
          status: customerData.status || "active",
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    const updatedCustomer = await db.collection("customers").findOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCustomer!._id.toString(),
        name: updatedCustomer!.name,
        email: updatedCustomer!.email,
        phone: updatedCustomer!.phone,
        address: updatedCustomer!.address,
        balance: updatedCustomer!.balance || 0,
        status: updatedCustomer!.status || "active",
        businessId: updatedCustomer!.businessId,
        totalInvoices: updatedCustomer!.totalInvoices || 0,
        paidInvoices: updatedCustomer!.paidInvoices || 0,
        createdAt: updatedCustomer!.createdAt,
        updatedAt: updatedCustomer!.updatedAt,
      },
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
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const result = await db.collection("customers").deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

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
