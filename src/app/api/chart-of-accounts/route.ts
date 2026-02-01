import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    console.log("API Route: GET request received for accounts");

    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Get all accounts from database
    const accounts = await db
      .collection("chart_of_accounts")
      .find({})
      .sort({ code: 1 })
      .toArray();

    console.log(`API Route: Found ${accounts.length} accounts in database`);

    return NextResponse.json({
      success: true,
      data: accounts.map((account) => ({
        id: account._id.toString(),
        code: account.code,
        name: account.name,
        type: account.type,
        balance: account.balance || 0,
        isActive: account.isActive !== false,
        description: account.description || "",
        businessId: account.businessId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("API Route: POST request received");
    const accountData = await request.json();
    console.log("API Route: Account data received:", accountData);

    // Validate required fields
    if (!accountData.code || !accountData.name || !accountData.type) {
      return NextResponse.json(
        { error: "Account code, name, and type are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Check if account code already exists
    const existingAccount = await db.collection("chart_of_accounts").findOne({
      code: accountData.code,
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this code already exists" },
        { status: 400 },
      );
    }

    // Create new account
    const newAccount = {
      code: accountData.code,
      name: accountData.name,
      type: accountData.type,
      balance: accountData.openingBalance || 0,
      isActive: accountData.isActive !== false,
      description: accountData.description || "",
      businessId: "demo-business", // In production, get from JWT
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("chart_of_accounts")
      .insertOne(newAccount);

    const createdAccount = {
      id: result.insertedId.toString(),
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      balance: newAccount.balance,
      isActive: newAccount.isActive,
      description: newAccount.description,
      businessId: newAccount.businessId,
      createdAt: newAccount.createdAt.toISOString(),
      updatedAt: newAccount.updatedAt.toISOString(),
    };

    console.log("API Route: Account created successfully:", createdAccount);

    return NextResponse.json({
      success: true,
      data: createdAccount,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}

// Add PUT method for updating accounts
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const accountData = await request.json();
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const result = await db.collection("chart_of_accounts").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...accountData,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updatedAccount = await db.collection("chart_of_accounts").findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAccount!._id.toString(),
        code: updatedAccount!.code,
        name: updatedAccount!.name,
        type: updatedAccount!.type,
        balance: updatedAccount!.balance || 0,
        isActive: updatedAccount!.isActive !== false,
        description: updatedAccount!.description || "",
        businessId: updatedAccount!.businessId,
        createdAt: updatedAccount!.createdAt,
        updatedAt: updatedAccount!.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}

// Add DELETE method for deleting accounts
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const result = await db.collection("chart_of_accounts").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
