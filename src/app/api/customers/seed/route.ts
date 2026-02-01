import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";

const defaultCustomers = [
  {
    name: "ABC Corporation",
    email: "billing@abccorp.com",
    phone: "+1-555-0101",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    balance: 5000,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 12,
    paidInvoices: 10,
  },
  {
    name: "XYZ Industries",
    email: "accounts@xyzindustries.com",
    phone: "+1-555-0102",
    address: "456 Industrial Blvd, Los Angeles, CA 90001",
    balance: 2500,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 8,
    paidInvoices: 6,
  },
  {
    name: "Global Tech Solutions",
    email: "finance@globaltech.com",
    phone: "+1-555-0103",
    address: "789 Innovation Drive, Chicago, IL 60601",
    balance: 7500,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 15,
    paidInvoices: 12,
  },
  {
    name: "Small Business LLC",
    email: "owner@smallbusinessllc.com",
    phone: "+1-555-0104",
    address: "321 Main Street, Portland, OR 97201",
    balance: -500,
    status: "inactive",
    businessId: "demo-business",
    totalInvoices: 3,
    paidInvoices: 4,
  },
  {
    name: "Enterprise Systems Inc",
    email: "accounting@enterprisesys.com",
    phone: "+1-555-0105",
    address: "555 Corporate Plaza, Houston, TX 77001",
    balance: 12000,
    status: "active",
    businessId: "demo-business",
    totalInvoices: 25,
    paidInvoices: 20,
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log("Seeding customers...");
    
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Clear existing customers
    await db.collection("customers").deleteMany({});
    
    // Insert default customers with timestamps
    const customersWithTimestamps = defaultCustomers.map(customer => ({
      ...customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await db.collection("customers").insertMany(customersWithTimestamps);
    
    console.log(`Successfully seeded ${result.insertedCount} customers`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.insertedCount} customers`,
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Error seeding customers:", error);
    return NextResponse.json(
      { error: "Failed to seed customers" },
      { status: 500 },
    );
  }
}
