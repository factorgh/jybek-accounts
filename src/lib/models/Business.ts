import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import { Business } from "@/types";

export class BusinessService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  static async createBusiness(
    businessData: Omit<Business, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Business> {
    const db = await this.getDb();
    const business = {
      ...businessData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("businesses").insertOne(business);
    return { ...business, _id: result.insertedId.toString() };
  }

  static async getBusinessById(id: string): Promise<Business | null> {
    const db = await this.getDb();
    return await db
      .collection<Business>("businesses")
      .findOne({ _id: new ObjectId(id) });
  }

  static async updateBusiness(
    id: string,
    updateData: Partial<Business>,
  ): Promise<Business | null> {
    const db = await this.getDb();
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("businesses")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" },
      );

    return result;
  }

  static async deleteBusiness(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db
      .collection("businesses")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}
