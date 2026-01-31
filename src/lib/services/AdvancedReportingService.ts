import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  CashFlowReport,
  AgedReceivablesReport,
  AgedPayablesReport,
  BudgetVarianceReport,
  CustomReport,
  ReportTemplate,
  ReportParameters,
  DateRange,
  CashFlowItem,
  AgedBucket,
  BudgetVarianceLine,
} from "@/types/quickbooks-features";

export class AdvancedReportingService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  /**
   * Generate Cash Flow Statement (IAS 7 compliant)
   */
  static async generateCashFlowStatement(
    businessId: string,
    period: DateRange,
  ): Promise<CashFlowReport> {
    const db = await this.getDb();

    // Get cash and cash equivalent accounts
    const cashAccounts = await db
      .collection("accounts")
      .find({
        businessId,
        type: "asset",
        $or: [{ name: /cash/i }, { name: /bank/i }, { code: /^1[0-9]/ }],
      })
      .toArray();

    const cashAccountIds = cashAccounts.map((acc) => acc._id.toString());

    // Get transactions for the period
    const transactions = await db
      .collection("transactions")
      .find({
        businessId,
        transactionDate: { $gte: period.startDate, $lte: period.endDate },
      })
      .toArray();

    // Calculate opening cash balance
    const openingBalance = await this.calculateCashBalance(
      businessId,
      period.startDate,
      cashAccountIds,
    );

    // Calculate cash flows by category
    const operatingActivities = await this.calculateOperatingCashFlows(
      businessId,
      period,
      transactions,
    );
    const investingActivities = await this.calculateInvestingCashFlows(
      businessId,
      period,
      transactions,
    );
    const financingActivities = await this.calculateFinancingCashFlows(
      businessId,
      period,
      transactions,
    );

    // Calculate net cash flow and closing balance
    const netOperatingCash = operatingActivities.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const netInvestingCash = investingActivities.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const netFinancingCash = financingActivities.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const netIncreaseInCash =
      netOperatingCash + netInvestingCash + netFinancingCash;
    const closingBalance = openingBalance + netIncreaseInCash;

    return {
      id: new ObjectId().toString(),
      businessId,
      reportPeriod: period,
      operatingActivities,
      investingActivities,
      financingActivities,
      netIncreaseInCash,
      cashAtBeginningOfPeriod: openingBalance,
      cashAtEndOfPeriod: closingBalance,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate Aged Receivables Report
   */
  static async generateAgedReceivablesReport(
    businessId: string,
    asOfDate: Date,
  ): Promise<AgedReceivablesReport> {
    const db = await this.getDb();

    // Get unpaid invoices
    const unpaidInvoices = await db
      .collection("invoices")
      .find({
        businessId,
        status: { $in: ["sent", "partial"] },
        dueDate: { $lte: asOfDate },
      })
      .toArray();

    // Calculate aging buckets
    const agingBuckets = this.calculateAgingBuckets(unpaidInvoices, asOfDate);

    const totalOutstanding = unpaidInvoices.reduce(
      (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
      0,
    );
    const currentAmount =
      agingBuckets.find((bucket) => bucket.daysRange === "Current")?.amount ||
      0;
    const overdueAmount = totalOutstanding - currentAmount;

    return {
      id: new ObjectId().toString(),
      businessId,
      asOfDate,
      agingBuckets,
      totalOutstanding,
      currentAmount,
      overdueAmount,
    };
  }

  /**
   * Generate Aged Payables Report
   */
  static async generateAgedPayablesReport(
    businessId: string,
    asOfDate: Date,
  ): Promise<AgedPayablesReport> {
    const db = await this.getDb();

    // Get unpaid bills/expenses
    const unpaidBills = await db
      .collection("bills")
      .find({
        businessId,
        status: { $in: ["open", "partial"] },
        dueDate: { $lte: asOfDate },
      })
      .toArray();

    // Calculate aging buckets
    const agingBuckets = this.calculateAgingBuckets(unpaidBills, asOfDate);

    const totalOutstanding = unpaidBills.reduce(
      (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
      0,
    );
    const currentAmount =
      agingBuckets.find((bucket) => bucket.daysRange === "Current")?.amount ||
      0;
    const overdueAmount = totalOutstanding - currentAmount;

    return {
      id: new ObjectId().toString(),
      businessId,
      asOfDate,
      agingBuckets,
      totalOutstanding,
      currentAmount,
      overdueAmount,
    };
  }

  /**
   * Generate Budget Variance Report
   */
  static async generateBudgetVarianceReport(
    businessId: string,
    budgetId: string,
    period: DateRange,
  ): Promise<BudgetVarianceReport> {
    const db = await this.getDb();

    // Get budget details
    const budget = await db.collection("budgets").findOne({
      _id: new ObjectId(budgetId),
      businessId,
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Get budget lines
    const budgetLines = await db
      .collection("budget_lines")
      .find({ budgetId })
      .toArray();

    // Calculate actual amounts for each budget line
    const lineItems: BudgetVarianceLine[] = [];
    let totalBudgeted = 0;
    let totalActual = 0;

    for (const budgetLine of budgetLines) {
      const actualAmount = await this.calculateActualAmount(
        businessId,
        budgetLine.accountId,
        period,
      );

      const variance = actualAmount - budgetLine.budgetedAmount;
      const variancePercentage =
        budgetLine.budgetedAmount > 0
          ? (variance / budgetLine.budgetedAmount) * 100
          : 0;

      const status =
        variance > 0 ? "unfavorable" : variance < 0 ? "favorable" : "neutral";

      lineItems.push({
        accountId: budgetLine.accountId,
        accountName: budgetLine.accountName || "Unknown Account",
        budgetedAmount: budgetLine.budgetedAmount,
        actualAmount,
        variance,
        variancePercentage,
        status,
      });

      totalBudgeted += budgetLine.budgetedAmount;
      totalActual += actualAmount;
    }

    const totalVariance = totalActual - totalBudgeted;
    const totalVariancePercentage =
      totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

    return {
      id: new ObjectId().toString(),
      businessId,
      budgetId,
      reportPeriod: period,
      budgetedAmount: totalBudgeted,
      actualAmount: totalActual,
      variance: totalVariance,
      variancePercentage: totalVariancePercentage,
      lineItems,
    };
  }

  /**
   * Generate Custom Report
   */
  static async generateCustomReport(
    businessId: string,
    templateId: string,
    parameters: ReportParameters,
  ): Promise<CustomReport> {
    const db = await this.getDb();

    // Get report template
    const template = await db.collection("report_templates").findOne({
      _id: new ObjectId(templateId),
      businessId,
    });

    if (!template) {
      throw new Error("Report template not found");
    }

    // Generate report based on template configuration
    const reportData = await this.executeReportTemplate(template, parameters);

    // Save generated report
    const generatedReport = {
      businessId,
      templateId,
      reportName: `${template.name} - ${parameters.dateRange.startDate.toISOString().split("T")[0]}`,
      reportData,
      parameters,
      generatedAt: new Date(),
    };

    const result = await db
      .collection("generated_reports")
      .insertOne(generatedReport);

    return {
      id: result.insertedId.toString(),
      businessId,
      templateId,
      reportName: generatedReport.reportName,
      reportData,
      parameters,
      generatedAt: generatedReport.generatedAt,
      generatedBy: "system", // TODO: Get from auth context
    };
  }

  /**
   * Get available report templates
   */
  static async getReportTemplates(
    businessId: string,
  ): Promise<ReportTemplate[]> {
    const db = await this.getDb();

    const templates = await db
      .collection("report_templates")
      .find({
        $or: [{ businessId }, { isSystem: true }],
      })
      .toArray();

    return templates.map((template) => ({
      id: template._id.toString(),
      businessId: template.businessId,
      name: template.name,
      description: template.description,
      templateConfig: template.templateConfig,
      isSystem: template.isSystem,
      createdAt: template.createdAt,
    }));
  }

  /**
   * Create custom report template
   */
  static async createReportTemplate(
    businessId: string,
    templateData: Omit<ReportTemplate, "id" | "createdAt">,
  ): Promise<ReportTemplate> {
    const db = await this.getDb();

    const template = {
      ...templateData,
      createdAt: new Date(),
    };

    const result = await db.collection("report_templates").insertOne(template);

    return {
      id: result.insertedId.toString(),
      businessId: template.businessId,
      name: template.name,
      description: template.description,
      templateConfig: template.templateConfig,
      isSystem: template.isSystem,
      createdAt: template.createdAt,
    };
  }

  // Private helper methods

  private static async calculateCashBalance(
    businessId: string,
    asOfDate: Date,
    cashAccountIds: string[],
  ): Promise<number> {
    const db = await this.getDb();

    const transactions = await db
      .collection("transactions")
      .find({
        businessId,
        transactionDate: { $lt: asOfDate },
      })
      .toArray();

    let balance = 0;

    for (const transaction of transactions) {
      for (const line of transaction.lines || []) {
        if (cashAccountIds.includes(line.accountId)) {
          balance += line.debitAmount - line.creditAmount;
        }
      }
    }

    return balance;
  }

  private static async calculateOperatingCashFlows(
    businessId: string,
    period: DateRange,
    transactions: any[],
  ): Promise<CashFlowItem[]> {
    // Operating activities include cash receipts from customers and cash payments to suppliers
    const operatingFlows: CashFlowItem[] = [];

    // Cash receipts from customers (sales revenue)
    const customerReceipts = transactions.filter(
      (t) =>
        t.type === "income" &&
        t.transactionDate >= period.startDate &&
        t.transactionDate <= period.endDate,
    );

    customerReceipts.forEach((receipt) => {
      const amount =
        receipt.lines?.reduce(
          (sum: number, line: any) =>
            line.creditAmount > 0 ? sum + line.creditAmount : sum,
          0,
        ) || 0;

      if (amount > 0) {
        operatingFlows.push({
          description: `Customer Receipt - ${receipt.description}`,
          amount,
          category: "Cash receipts from customers",
          accountId: receipt.lines?.find((l: any) => l.creditAmount > 0)
            ?.accountId,
          transactionId: receipt._id.toString(),
        });
      }
    });

    // Cash payments to suppliers (expenses)
    const supplierPayments = transactions.filter(
      (t) =>
        t.type === "expense" &&
        t.transactionDate >= period.startDate &&
        t.transactionDate <= period.endDate,
    );

    supplierPayments.forEach((payment) => {
      const amount =
        payment.lines?.reduce(
          (sum: number, line: any) =>
            line.debitAmount > 0 ? sum + line.debitAmount : sum,
          0,
        ) || 0;

      if (amount > 0) {
        operatingFlows.push({
          description: `Supplier Payment - ${payment.description}`,
          amount: -amount, // Negative for cash outflow
          category: "Cash payments to suppliers",
          accountId: payment.lines?.find((l: any) => l.debitAmount > 0)
            ?.accountId,
          transactionId: payment._id.toString(),
        });
      }
    });

    return operatingFlows;
  }

  private static async calculateInvestingCashFlows(
    businessId: string,
    period: DateRange,
    transactions: any[],
  ): Promise<CashFlowItem[]> {
    // Investing activities include purchase/sale of long-term assets
    const investingFlows: CashFlowItem[] = [];

    // This would include fixed asset purchases, sales, etc.
    // For now, return empty array - to be implemented with fixed assets module

    return investingFlows;
  }

  private static async calculateFinancingCashFlows(
    businessId: string,
    period: DateRange,
    transactions: any[],
  ): Promise<CashFlowItem[]> {
    // Financing activities include loans, equity transactions, dividends
    const financingFlows: CashFlowItem[] = [];

    // This would include loan proceeds, repayments, equity contributions, dividends
    // For now, return empty array - to be implemented with financing module

    return financingFlows;
  }

  private static calculateAgingBuckets(
    items: any[],
    asOfDate: Date,
  ): AgedBucket[] {
    const buckets = [
      { daysRange: "Current", amount: 0, count: 0, percentage: 0 },
      { daysRange: "1-30", amount: 0, count: 0, percentage: 0 },
      { daysRange: "31-60", amount: 0, count: 0, percentage: 0 },
      { daysRange: "61-90", amount: 0, count: 0, percentage: 0 },
      { daysRange: "91+", amount: 0, count: 0, percentage: 0 },
    ];

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.totalAmount - item.paidAmount),
      0,
    );

    items.forEach((item) => {
      const outstanding = item.totalAmount - item.paidAmount;
      const daysOverdue = Math.floor(
        (asOfDate.getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      let bucketIndex = 0;
      if (daysOverdue <= 0)
        bucketIndex = 0; // Current
      else if (daysOverdue <= 30) bucketIndex = 1;
      else if (daysOverdue <= 60) bucketIndex = 2;
      else if (daysOverdue <= 90) bucketIndex = 3;
      else bucketIndex = 4; // 91+

      buckets[bucketIndex].amount += outstanding;
      buckets[bucketIndex].count += 1;
    });

    // Calculate percentages
    buckets.forEach((bucket) => {
      bucket.percentage =
        totalAmount > 0 ? (bucket.amount / totalAmount) * 100 : 0;
    });

    return buckets;
  }

  private static async calculateActualAmount(
    businessId: string,
    accountId: string,
    period: DateRange,
  ): Promise<number> {
    const db = await this.getDb();

    const transactions = await db
      .collection("transactions")
      .find({
        businessId,
        transactionDate: { $gte: period.startDate, $lte: period.endDate },
        "lines.accountId": accountId,
      })
      .toArray();

    let actualAmount = 0;

    transactions.forEach((transaction) => {
      transaction.lines?.forEach((line: any) => {
        if (line.accountId === accountId) {
          // For expense accounts, sum debits
          // For income accounts, sum credits
          actualAmount += line.debitAmount - line.creditAmount;
        }
      });
    });

    return Math.abs(actualAmount);
  }

  private static async executeReportTemplate(
    template: any,
    parameters: ReportParameters,
  ): Promise<any> {
    // This would execute the custom report template
    // For now, return placeholder data
    return {
      templateName: template.name,
      parameters,
      data: [],
      generatedAt: new Date(),
    };
  }
}
