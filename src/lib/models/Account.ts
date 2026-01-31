import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import { Account, AccountType } from "@/types";

export class AccountService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  static async createAccount(
    accountData: Omit<Account, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Account> {
    const db = await this.getDb();
    const account = {
      ...accountData,
      balance: accountData.balance || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("accounts").insertOne(account);
    return { ...account, _id: result.insertedId.toString() };
  }

  static async getAccountsByBusiness(businessId: string): Promise<Account[]> {
    const db = await this.getDb();
    return await db
      .collection<Account>("accounts")
      .find({ businessId })
      .sort({ code: 1 })
      .toArray();
  }

  static async getAccountById(id: string): Promise<Account | null> {
    const db = await this.getDb();
    return await db
      .collection<Account>("accounts")
      .findOne({ _id: new ObjectId(id) });
  }

  static async updateAccount(
    id: string,
    updateData: Partial<Account>,
  ): Promise<Account | null> {
    const db = await this.getDb();
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection("accounts")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" },
      );

    return result;
  }

  static async deleteAccount(id: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db
      .collection("accounts")
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async seedDefaultAccounts(businessId: string): Promise<Account[]> {
    const defaultAccounts = [
      { code: "1000", name: "Cash", type: AccountType.Asset, isActive: true },
      {
        code: "1100",
        name: "Bank Account",
        type: AccountType.Asset,
        isActive: true,
      },
      {
        code: "1200",
        name: "Accounts Receivable",
        type: AccountType.Asset,
        isActive: true,
      },
      {
        code: "2000",
        name: "Accounts Payable",
        type: AccountType.Liability,
        isActive: true,
      },
      {
        code: "3000",
        name: "Owner's Capital",
        type: AccountType.Equity,
        isActive: true,
      },
      {
        code: "4000",
        name: "Sales Revenue",
        type: AccountType.Income,
        isActive: true,
      },
      {
        code: "4100",
        name: "Service Income",
        type: AccountType.Income,
        isActive: true,
      },
      {
        code: "5000",
        name: "Rent Expense",
        type: AccountType.Expense,
        isActive: true,
      },
      {
        code: "5100",
        name: "Utilities Expense",
        type: AccountType.Expense,
        isActive: true,
      },
      {
        code: "5200",
        name: "Transport Expense",
        type: AccountType.Expense,
        isActive: true,
      },
      {
        code: "5300",
        name: "Office Supplies",
        type: AccountType.Expense,
        isActive: true,
      },
    ];

    const accounts: Account[] = [];
    for (const accountData of defaultAccounts) {
      const account = await this.createAccount({
        businessId,
        ...accountData,
        balance: 0,
      });
      accounts.push(account);
    }

    return accounts;
  }
}
