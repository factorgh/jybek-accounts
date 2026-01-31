import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  Transaction,
  TransactionLine,
  TransactionType,
  Account,
  AccountType,
} from "@/types";

interface TransactionLineDto {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

export class LedgerService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  static async postJournalEntry(
    businessId: string,
    transactionDate: Date,
    description: string,
    reference: string | undefined,
    lines: TransactionLineDto[],
    userId?: string,
  ): Promise<Transaction> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;

      await clientSession.withTransaction(async () => {
        // Validate transaction balances
        const totalDebits = lines.reduce(
          (sum, line) => sum + line.debitAmount,
          0,
        );
        const totalCredits = lines.reduce(
          (sum, line) => sum + line.creditAmount,
          0,
        );

        if (totalDebits !== totalCredits) {
          throw new Error(
            `Transaction does not balance. Debits: ${totalDebits}, Credits: ${totalCredits}`,
          );
        }

        if (totalDebits === 0) {
          throw new Error(
            "Transaction must have at least one non-zero amount.",
          );
        }

        // Validate all accounts exist and are active
        for (const line of lines) {
          const account = await db.collection<Account>("accounts").findOne({
            _id: new ObjectId(line.accountId),
            businessId,
            isActive: true,
          });

          if (!account) {
            throw new Error(
              `Account with ID ${line.accountId} not found or inactive.`,
            );
          }
        }

        // Generate transaction number
        const transactionNumber = await this.generateTransactionNumber(
          db,
          businessId,
        );

        // Create transaction
        const transaction: Omit<Transaction, "_id"> = {
          businessId,
          transactionNumber,
          transactionDate,
          description,
          reference,
          type: TransactionType.ManualJournal,
          isReversed: false,
          createdByUserId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await db
          .collection("transactions")
          .insertOne(transaction, { session: clientSession });
        const transactionId = result.insertedId.toString();

        // Create transaction lines
        const transactionLines: Omit<TransactionLine, "_id">[] = lines.map(
          (line) => ({
            transactionId,
            accountId: line.accountId,
            debitAmount: line.debitAmount,
            creditAmount: line.creditAmount,
            description: line.description,
            createdAt: new Date(),
          }),
        );

        await db
          .collection("transactionLines")
          .insertMany(transactionLines, { session: clientSession });

        // Update account balances
        await this.updateAccountBalances(
          db,
          businessId,
          transactionLines,
          clientSession,
        );
      });

      // Return the created transaction
      const createdTransaction = await db
        .collection<Transaction>("transactions")
        .findOne({
          businessId,
          transactionNumber: (
            await this.generateTransactionNumber(db, businessId)
          ).replace(
            /\d+$/,
            String(
              parseInt(
                (await this.generateTransactionNumber(db, businessId))
                  .split("-")
                  .pop() || "0",
              ) - 1,
            ),
          ),
        });

      if (!createdTransaction) {
        throw new Error("Failed to retrieve created transaction");
      }

      return createdTransaction;
    } catch (error) {
      throw error;
    }
  }

  static async postIncome(
    businessId: string,
    incomeAccountId: string,
    cashAccountId: string,
    amount: number,
    transactionDate: Date,
    description: string,
    reference?: string,
    userId?: string,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error("Income amount must be greater than zero.");
    }

    const lines: TransactionLineDto[] = [
      {
        accountId: cashAccountId,
        debitAmount: amount,
        creditAmount: 0,
        description: "Income received",
      },
      {
        accountId: incomeAccountId,
        debitAmount: 0,
        creditAmount: amount,
        description: description,
      },
    ];

    return await this.postJournalEntry(
      businessId,
      transactionDate,
      description,
      reference,
      lines,
      userId,
    );
  }

  static async postExpense(
    businessId: string,
    expenseAccountId: string,
    cashAccountId: string,
    amount: number,
    transactionDate: Date,
    description: string,
    reference?: string,
    userId?: string,
  ): Promise<Transaction> {
    if (amount <= 0) {
      throw new Error("Expense amount must be greater than zero.");
    }

    const lines: TransactionLineDto[] = [
      {
        accountId: expenseAccountId,
        debitAmount: amount,
        creditAmount: 0,
        description: description,
      },
      {
        accountId: cashAccountId,
        debitAmount: 0,
        creditAmount: amount,
        description: "Expense paid",
      },
    ];

    return await this.postJournalEntry(
      businessId,
      transactionDate,
      description,
      reference,
      lines,
      userId,
    );
  }

  static async reverseTransaction(
    transactionId: string,
    reason: string,
    userId?: string,
  ): Promise<Transaction> {
    const db = await this.getDb();

    // Get original transaction
    const originalTransaction = await db
      .collection<Transaction>("transactions")
      .findOne({
        _id: new ObjectId(transactionId),
      });

    if (!originalTransaction) {
      throw new Error(`Transaction with ID ${transactionId} not found.`);
    }

    if (originalTransaction.isReversed) {
      throw new Error("Transaction is already reversed.");
    }

    // Get transaction lines
    const originalLines = await db
      .collection<TransactionLine>("transactionLines")
      .find({
        transactionId,
      })
      .toArray();

    // Reverse all lines (swap debits and credits)
    const reversedLines: TransactionLineDto[] = originalLines.map((line) => ({
      accountId: line.accountId,
      debitAmount: line.creditAmount,
      creditAmount: line.debitAmount,
      description: `Reversal: ${line.description}`,
    }));

    const reversalTransaction = await this.postJournalEntry(
      originalTransaction.businessId,
      new Date(),
      `Reversal: ${originalTransaction.description} - ${reason}`,
      `REV-${originalTransaction.transactionNumber}`,
      reversedLines,
      userId,
    );

    // Mark original transaction as reversed
    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          isReversed: true,
          reversedByTransactionId: reversalTransaction._id,
          updatedAt: new Date(),
        },
      },
    );

    return reversalTransaction;
  }

  private static async generateTransactionNumber(
    db: Db,
    businessId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JE-${year}-`;

    const lastTransaction = await db
      .collection<Transaction>("transactions")
      .find({
        businessId,
        transactionNumber: { $regex: `^${prefix}` },
      })
      .sort({ transactionNumber: -1 })
      .limit(1)
      .toArray();

    let nextNumber = 1;
    if (lastTransaction.length > 0) {
      const lastNumber = parseInt(
        lastTransaction[0].transactionNumber.split("-").pop() || "0",
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, "0")}`;
  }

  private static async updateAccountBalances(
    db: Db,
    businessId: string,
    transactionLines: Omit<TransactionLine, "_id">[],
    session: ClientSession,
  ): Promise<void> {
    for (const line of transactionLines) {
      const account = await db.collection<Account>("accounts").findOne({
        _id: new ObjectId(line.accountId),
        businessId,
      });

      if (!account) continue;

      let balanceChange = 0;

      // Calculate balance change based on account type and transaction direction
      if (
        account.type === AccountType.Asset ||
        account.type === AccountType.Expense
      ) {
        balanceChange = line.debitAmount - line.creditAmount;
      } else {
        balanceChange = line.creditAmount - line.debitAmount;
      }

      await db.collection("accounts").updateOne(
        { _id: new ObjectId(line.accountId) },
        {
          $inc: { balance: balanceChange },
          $set: { updatedAt: new Date() },
        },
        { session },
      );
    }
  }
}
