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

    const account = await db.collection("chart_of_accounts").findOne({
      _id: new ObjectId(params.id),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const accountData = await request.json();
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    // Validate required fields
    if (!accountData.code || !accountData.name || !accountData.type) {
      return NextResponse.json(
        { error: "Code, name, and type are required" },
        { status: 400 },
      );
    }

    // Check if code already exists for another account
    const existingAccount = await db.collection("chart_of_accounts").findOne({
      code: accountData.code,
      _id: { $ne: new ObjectId(params.id) },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "Account with this code already exists" },
        { status: 400 },
      );
    }

    // Update account
    const result = await db.collection("chart_of_accounts").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          code: accountData.code,
          name: accountData.name,
          type: accountData.type,
          description: accountData.description || "",
          parentCode: accountData.parentCode || "",
          balance: accountData.balance !== undefined ? accountData.balance : 0,
          isActive: accountData.isActive !== false,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updatedAccount = await db.collection("chart_of_accounts").findOne({
      _id: new ObjectId(params.id),
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const client = await clientPromise;
    const db = client.db("jybek_accounts");

    const result = await db.collection("chart_of_accounts").deleteOne({
      _id: new ObjectId(params.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}
