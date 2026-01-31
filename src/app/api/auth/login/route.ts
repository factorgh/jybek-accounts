import { NextRequest, NextResponse } from "next/server";

// Mock user database - in production, this would be in a real database
const users = [
  {
    id: "1",
    email: "admin@jybek.com",
    password: "admin123", // In production, this would be hashed
    name: "Admin User",
    businessId: "demo-business",
    role: "admin",
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Create JWT token (simplified - in production, use a proper JWT library)
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        businessId: user.businessId,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    ).toString("base64");

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
