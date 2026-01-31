import { NextRequest, NextResponse } from "next/server";
import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import { AuthService } from "@/lib/auth/jwt";
import { BusinessService } from "@/lib/models/Business";
import { AccountService } from "@/lib/models/Account";
import { User, Business } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      businessName,
      fiscalYearStart,
      openingBalance,
    } = await request.json();

    if (!email || !password || !name || !businessName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await clientPromise.then((client) =>
      client.db("jybek_accounts"),
    );

    // Check if user already exists
    const existingUser = await db.collection<User>("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create business
    const businessData: Omit<Business, "_id" | "createdAt" | "updatedAt"> = {
      name: businessName,
      email,
      fiscalYearStart: new Date(fiscalYearStart),
      openingBalance: openingBalance || 0,
    };

    const business = await BusinessService.createBusiness(businessData);

    // Create user
    const userData = {
      email,
      name,
      businessId: business._id!,
      role: "admin" as const,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(userData);
    const user = { ...userData, _id: result.insertedId.toString() };

    // Seed default accounts
    await AccountService.seedDefaultAccounts(business._id!);

    // Post opening balance if provided
    if (openingBalance && openingBalance > 0) {
      const { LedgerService } = await import("@/lib/services/LedgerService");

      // Get cash and equity accounts
      const accounts = await AccountService.getAccountsByBusiness(
        business._id!,
      );
      const cashAccount = accounts.find((a) => a.code === "1000"); // Cash
      const equityAccount = accounts.find((a) => a.code === "3000"); // Owner's Capital

      if (cashAccount && equityAccount) {
        await LedgerService.postOpeningBalance(
          business._id!,
          openingBalance,
          equityAccount._id!,
          cashAccount._id!,
          new Date(),
          user._id,
        );
      }
    }

    // Generate JWT token
    const token = AuthService.generateToken(user);

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        businessId: user.businessId,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
