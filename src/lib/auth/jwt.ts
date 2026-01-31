import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "@/types";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

export interface JWTPayload {
  userId: string;
  email: string;
  businessId: string;
  role: string;
}

export class AuthService {
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user._id!,
      email: user.email,
      businessId: user.businessId,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateApiKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export the functions that API routes are trying to import
export const verifyJWT = AuthService.verifyToken;
export const verifyJwtToken = AuthService.verifyToken;
