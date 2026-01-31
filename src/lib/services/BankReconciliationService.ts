import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  BankAccount,
  BankStatement,
  ReconciliationMatch,
  ReconciliationRule,
  ReconciliationVariance,
  MatchType,
  ImportSource,
  VarianceType,
} from "@/types/quickbooks-features";

export class BankReconciliationService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  /**
   * Create a new bank account
   */
  static async createBankAccount(
    businessId: string,
    accountData: Omit<BankAccount, "id" | "createdAt" | "updatedAt">,
  ): Promise<BankAccount> {
    const db = await this.getDb();

    const account = {
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bank_accounts").insertOne(account);

    return {
      id: result.insertedId.toString(),
      businessId: account.businessId,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountType: account.accountType,
      currency: account.currency,
      isActive: account.isActive,
      lastReconciliationDate: account.lastReconciliationDate,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * Get all bank accounts for a business
   */
  static async getBankAccounts(businessId: string): Promise<BankAccount[]> {
    const db = await this.getDb();

    const accounts = await db
      .collection("bank_accounts")
      .find({ businessId, isActive: true })
      .sort({ accountName: 1 })
      .toArray();

    return accounts.map((account) => ({
      id: account._id.toString(),
      businessId: account.businessId,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      accountType: account.accountType,
      currency: account.currency,
      isActive: account.isActive,
      lastReconciliationDate: account.lastReconciliationDate,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  /**
   * Import bank statement
   */
  static async importBankStatement(
    businessId: string,
    bankAccountId: string,
    statementData: Omit<BankStatement, "id" | "importedAt">,
  ): Promise<BankStatement> {
    const db = await this.getDb();

    const statement = {
      ...statementData,
      importedAt: new Date(),
    };

    const result = await db.collection("bank_statements").insertOne(statement);

    return {
      id: result.insertedId.toString(),
      bankAccountId: statement.bankAccountId,
      statementDate: statement.statementDate,
      openingBalance: statement.openingBalance,
      closingBalance: statement.closingBalance,
      statementLines: statement.statementLines,
      importSource: statement.importSource,
      fileName: statement.fileName,
      importedAt: statement.importedAt,
      importedBy: statement.importedBy,
    };
  }

  /**
   * Auto-match transactions using rules
   */
  static async autoMatchTransactions(
    businessId: string,
    statementId: string,
  ): Promise<ReconciliationMatch[]> {
    const db = await this.getDb();

    // Get statement
    const statement = await db.collection("bank_statements").findOne({
      _id: new ObjectId(statementId),
    });

    if (!statement) {
      throw new Error("Bank statement not found");
    }

    // Get reconciliation rules for the business
    const rules = await db
      .collection("reconciliation_rules")
      .find({ businessId, isActive: true })
      .sort({ priority: -1 })
      .toArray();

    // Get transactions for matching
    const transactions = await db
      .collection("transactions")
      .find({ businessId })
      .toArray();

    const matches: ReconciliationMatch[] = [];

    // Process each statement line
    statement.statementLines.forEach((line: any, index: number) => {
      let bestMatch: any = null;
      let bestScore = 0;

      // Try to match using rules
      for (const rule of rules) {
        const matchResult = this.applyReconciliationRule(
          line,
          transactions,
          rule,
        );
        if (matchResult && matchResult.confidence > bestScore) {
          bestMatch = matchResult;
          bestScore = matchResult.confidence;
        }
      }

      // If no rule matched, try fuzzy matching
      if (!bestMatch) {
        bestMatch = this.performFuzzyMatching(line, transactions);
      }

      if (bestMatch && bestScore >= 0.7) {
        // Only accept matches with 70%+ confidence
        matches.push({
          id: new ObjectId().toString(),
          statementId,
          statementLineIndex: index,
          transactionId: bestMatch.transactionId,
          matchType: bestMatch.ruleBased
            ? MatchType.RULE_BASED
            : MatchType.AUTO,
          confidenceScore: bestScore,
          matchedBy: "system",
          matchedAt: new Date(),
          notes: bestMatch.notes,
        });
      }
    });

    // Save matches
    if (matches.length > 0) {
      await db.collection("reconciliation_matches").insertMany(matches);
    }

    return matches;
  }

  /**
   * Create manual reconciliation match
   */
  static async createManualMatch(
    businessId: string,
    statementId: string,
    statementLineIndex: number,
    transactionId: string,
    notes?: string,
  ): Promise<ReconciliationMatch> {
    const db = await this.getDb();

    const match = {
      statementId,
      statementLineIndex,
      transactionId,
      matchType: MatchType.MANUAL,
      confidenceScore: 1.0,
      matchedBy: "user", // TODO: Get from auth context
      matchedAt: new Date(),
      notes,
    };

    const result = await db
      .collection("reconciliation_matches")
      .insertOne(match);

    return {
      id: result.insertedId.toString(),
      statementId: match.statementId,
      statementLineIndex: match.statementLineIndex,
      transactionId: match.transactionId,
      matchType: match.matchType,
      confidenceScore: match.confidenceScore,
      matchedBy: match.matchedBy,
      matchedAt: match.matchedAt,
      notes: match.notes,
    };
  }

  /**
   * Perform bank reconciliation
   */
  static async performReconciliation(
    businessId: string,
    bankAccountId: string,
    statementId: string,
  ): Promise<any> {
    const db = await this.getDb();

    // Get statement
    const statement = await db.collection("bank_statements").findOne({
      _id: new ObjectId(statementId),
      bankAccountId,
    });

    if (!statement) {
      throw new Error("Bank statement not found");
    }

    // Get existing matches
    const matches = await db
      .collection("reconciliation_matches")
      .find({ statementId })
      .toArray();

    // Calculate reconciliation summary
    const totalStatementLines = statement.statementLines.length;
    const matchedLines = matches.length;
    const unmatchedLines = totalStatementLines - matchedLines;

    const totalStatementAmount = statement.statementLines.reduce(
      (sum: number, line: any) => sum + line.amount,
      0,
    );

    const matchedAmount = matches.reduce((sum: number, match: any) => {
      const transaction = statement.statementLines[match.statementLineIndex];
      return sum + transaction.amount;
    }, 0);

    const unmatchedAmount = totalStatementAmount - matchedAmount;

    // Create reconciliation variances for unmatched items
    const variances: ReconciliationVariance[] = [];

    statement.statementLines.forEach((line: any, index: number) => {
      const isMatched = matches.some(
        (match: any) => match.statementLineIndex === index,
      );

      if (!isMatched) {
        variances.push({
          id: new ObjectId().toString(),
          reconciliationId: statementId,
          varianceType: VarianceType.MISSING_TRANSACTION,
          amount: line.amount,
          description: `Unmatched transaction: ${line.description}`,
          resolved: false,
        });
      }
    });

    // Save variances
    if (variances.length > 0) {
      await db.collection("reconciliation_variances").insertMany(variances);
    }

    // Update bank account's last reconciliation date
    await db.collection("bank_accounts").updateOne(
      { _id: new ObjectId(bankAccountId) },
      {
        $set: {
          lastReconciliationDate: statement.statementDate,
          updatedAt: new Date(),
        },
      },
    );

    return {
      statementId,
      bankAccountId,
      totalStatementLines,
      matchedLines,
      unmatchedLines,
      totalStatementAmount,
      matchedAmount,
      unmatchedAmount,
      matchPercentage:
        totalStatementLines > 0
          ? (matchedLines / totalStatementLines) * 100
          : 0,
      variances: variances.length,
    };
  }

  /**
   * Create reconciliation rule
   */
  static async createReconciliationRule(
    businessId: string,
    ruleData: Omit<ReconciliationRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReconciliationRule> {
    const db = await this.getDb();

    const rule = {
      ...ruleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("reconciliation_rules").insertOne(rule);

    return {
      id: result.insertedId.toString(),
      businessId: rule.businessId,
      ruleName: rule.ruleName,
      ruleConditions: rule.ruleConditions,
      matchCriteria: rule.matchCriteria,
      priority: rule.priority,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  /**
   * Get reconciliation matches for a statement
   */
  static async getReconciliationMatches(
    statementId: string,
  ): Promise<ReconciliationMatch[]> {
    const db = await this.getDb();

    const matches = await db
      .collection("reconciliation_matches")
      .find({ statementId })
      .sort({ matchedAt: -1 })
      .toArray();

    return matches.map((match) => ({
      id: match._id.toString(),
      statementId: match.statementId,
      statementLineIndex: match.statementLineIndex,
      transactionId: match.transactionId,
      matchType: match.matchType,
      confidenceScore: match.confidenceScore,
      matchedBy: match.matchedBy,
      matchedAt: match.matchedAt,
      notes: match.notes,
    }));
  }

  /**
   * Get reconciliation variances
   */
  static async getReconciliationVariances(
    statementId?: string,
  ): Promise<ReconciliationVariance[]> {
    const db = await this.getDb();

    const query: any = {};
    if (statementId) {
      query.reconciliationId = statementId;
    }

    const variances = await db
      .collection("reconciliation_variances")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return variances.map((variance) => ({
      id: variance._id.toString(),
      reconciliationId: variance.reconciliationId,
      varianceType: variance.varianceType,
      amount: variance.amount,
      description: variance.description,
      resolved: variance.resolved,
      resolvedAt: variance.resolvedAt,
      resolvedBy: variance.resolvedBy,
      resolutionNotes: variance.resolutionNotes,
    }));
  }

  // Private helper methods

  private static applyReconciliationRule(
    statementLine: any,
    transactions: any[],
    rule: any,
  ): any {
    // Apply rule conditions to find matching transactions
    const matchingTransactions = transactions.filter((transaction) => {
      return this.evaluateRuleConditions(
        statementLine,
        transaction,
        rule.ruleConditions,
      );
    });

    if (matchingTransactions.length === 0) {
      return null;
    }

    // Calculate confidence score based on match criteria
    let confidence = 0.5; // Base confidence

    // Amount matching
    if (rule.matchCriteria.amountTolerance) {
      const tolerance = rule.matchCriteria.amountTolerance;
      const bestMatch = matchingTransactions.reduce(
        (best: any, transaction: any) => {
          const amountDiff = Math.abs(
            statementLine.amount - this.getTransactionAmount(transaction),
          );
          const bestDiff = Math.abs(
            statementLine.amount - this.getTransactionAmount(best),
          );
          return amountDiff < bestDiff ? transaction : best;
        },
      );

      const amountDiff = Math.abs(
        statementLine.amount - this.getTransactionAmount(bestMatch),
      );
      if (amountDiff <= tolerance) {
        confidence += 0.3;
      }
    }

    // Date matching
    if (rule.matchCriteria.dateTolerance) {
      const tolerance = rule.matchCriteria.dateTolerance * 24 * 60 * 60 * 1000; // Convert days to milliseconds
      const dateDiff = Math.abs(
        new Date(statementLine.transactionDate).getTime() -
          new Date(bestMatch.transactionDate).getTime(),
      );
      if (dateDiff <= tolerance) {
        confidence += 0.2;
      }
    }

    return {
      transactionId: bestMatch._id.toString(),
      confidence: Math.min(confidence, 1.0),
      ruleBased: true,
      notes: `Matched using rule: ${rule.ruleName}`,
    };
  }

  private static performFuzzyMatching(
    statementLine: any,
    transactions: any[],
  ): any {
    // Simple fuzzy matching based on amount and description
    const potentialMatches = transactions.filter((transaction) => {
      const amountDiff = Math.abs(
        statementLine.amount - this.getTransactionAmount(transaction),
      );
      const dateDiff = Math.abs(
        new Date(statementLine.transactionDate).getTime() -
          new Date(transaction.transactionDate).getTime(),
      );

      // Match if amount is exact and within 7 days
      return amountDiff === 0 && dateDiff <= 7 * 24 * 60 * 60 * 1000;
    });

    if (potentialMatches.length === 0) {
      return null;
    }

    // Return the closest match
    const bestMatch = potentialMatches.reduce((best: any, transaction: any) => {
      const dateDiff = Math.abs(
        new Date(statementLine.transactionDate).getTime() -
          new Date(transaction.transactionDate).getTime(),
      );
      const bestDateDiff = Math.abs(
        new Date(statementLine.transactionDate).getTime() -
          new Date(best.transactionDate).getTime(),
      );
      return dateDiff < bestDateDiff ? transaction : best;
    });

    return {
      transactionId: bestMatch._id.toString(),
      confidence: 0.8, // High confidence for exact amount matches
      ruleBased: false,
      notes: "Auto-matched based on amount and date",
    };
  }

  private static evaluateRuleConditions(
    statementLine: any,
    transaction: any,
    conditions: any[],
  ): boolean {
    // Evaluate all conditions (AND logic)
    return conditions.every((condition) => {
      switch (condition.field) {
        case "amount":
          return this.evaluateAmountCondition(
            statementLine.amount,
            transaction,
            condition,
          );
        case "description":
          return this.evaluateDescriptionCondition(
            statementLine.description,
            transaction,
            condition,
          );
        case "date":
          return this.evaluateDateCondition(
            statementLine.transactionDate,
            transaction,
            condition,
          );
        default:
          return false;
      }
    });
  }

  private static evaluateAmountCondition(
    statementAmount: number,
    transaction: any,
    condition: any,
  ): boolean {
    const transactionAmount = this.getTransactionAmount(transaction);

    switch (condition.operator) {
      case "equals":
        return statementAmount === transactionAmount;
      case "greater_than":
        return statementAmount > transactionAmount;
      case "less_than":
        return statementAmount < transactionAmount;
      case "between":
        return (
          statementAmount >= condition.value[0] &&
          statementAmount <= condition.value[1]
        );
      default:
        return false;
    }
  }

  private static evaluateDescriptionCondition(
    statementDescription: string,
    transaction: any,
    condition: any,
  ): boolean {
    const transactionDescription = transaction.description || "";

    switch (condition.operator) {
      case "contains":
        return (
          statementDescription
            .toLowerCase()
            .includes(condition.value.toLowerCase()) ||
          transactionDescription
            .toLowerCase()
            .includes(condition.value.toLowerCase())
        );
      case "equals":
        return statementDescription === transactionDescription;
      case "starts_with":
        return (
          statementDescription.startsWith(condition.value) ||
          transactionDescription.startsWith(condition.value)
        );
      default:
        return false;
    }
  }

  private static evaluateDateCondition(
    statementDate: string,
    transaction: any,
    condition: any,
  ): boolean {
    const stmtDate = new Date(statementDate);
    const txnDate = new Date(transaction.transactionDate);

    switch (condition.operator) {
      case "equals":
        return stmtDate.toDateString() === txnDate.toDateString();
      case "greater_than":
        return stmtDate > txnDate;
      case "less_than":
        return stmtDate < txnDate;
      case "between":
        const startDate = new Date(condition.value[0]);
        const endDate = new Date(condition.value[1]);
        return stmtDate >= startDate && stmtDate <= endDate;
      default:
        return false;
    }
  }

  private static getTransactionAmount(transaction: any): number {
    // Calculate the net amount from transaction lines
    if (transaction.lines && transaction.lines.length > 0) {
      return transaction.lines.reduce((sum: number, line: any) => {
        return sum + (line.creditAmount || 0) - (line.debitAmount || 0);
      }, 0);
    }

    // Fallback to transaction amount if available
    return transaction.amount || 0;
  }

  /**
   * Get reconciliation summary
   */
  static async getReconciliationSummary(businessId: string): Promise<any[]> {
    const db = await this.getDb();

    const accounts = await db
      .collection("bank_accounts")
      .find({ businessId, isActive: true })
      .toArray();

    const summary = [];

    for (const account of accounts) {
      const statements = await db
        .collection("bank_statements")
        .find({ bankAccountId: account._id.toString() })
        .sort({ statementDate: -1 })
        .limit(10)
        .toArray();

      const recentStatement = statements[0];

      summary.push({
        accountId: account._id.toString(),
        accountName: account.accountName,
        bankName: account.bankName,
        accountType: account.accountType,
        lastReconciliationDate: account.lastReconciliationDate,
        recentStatement: recentStatement
          ? {
              statementDate: recentStatement.statementDate,
              openingBalance: recentStatement.openingBalance,
              closingBalance: recentStatement.closingBalance,
              importedAt: recentStatement.importedAt,
            }
          : null,
      });
    }

    return summary;
  }
}
