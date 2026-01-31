import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  Budget,
  BudgetLine,
  Forecast,
  ForecastLine,
  BudgetScenario,
  BudgetVarianceReport,
  BudgetVarianceLine,
  BudgetType,
  BudgetStatus,
  ForecastPeriod,
  ScenarioType,
  DateRange,
} from "@/types/quickbooks-features";

export class BudgetingService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  /**
   * Create a new budget
   */
  static async createBudget(
    businessId: string,
    budgetData: Omit<Budget, "id" | "createdAt" | "updatedAt">,
  ): Promise<Budget> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;
      let budgetId: string = "";

      const result = await clientSession.withTransaction(async () => {
        // Create budget
        const budget = {
          ...budgetData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const budgetResult = await db.collection("budgets").insertOne(budget);
        budgetId = budgetResult.insertedId.toString();

        // Create budget lines
        if (budgetData.lines && budgetData.lines.length > 0) {
          const budgetLines = budgetData.lines.map((line) => ({
            ...line,
            budgetId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          await db.collection("budget_lines").insertMany(budgetLines);
        }

        return budgetId;
      });

      // Return the created budget with lines
      return await this.getBudget(businessId, budgetId);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Get budget by ID
   */
  static async getBudget(
    businessId: string,
    budgetId: string,
  ): Promise<Budget> {
    const db = await this.getDb();

    const budget = await db.collection("budgets").findOne({
      _id: new ObjectId(budgetId),
      businessId,
    });

    if (!budget) {
      throw new Error("Budget not found");
    }

    // Get budget lines
    const lines = await db
      .collection("budget_lines")
      .find({ budgetId })
      .toArray();

    return {
      id: budget._id.toString(),
      businessId: budget.businessId,
      budgetName: budget.budgetName,
      budgetType: budget.budgetType,
      startDate: budget.startDate,
      endDate: budget.endDate,
      totalBudget: budget.totalBudget,
      status: budget.status,
      approvedBy: budget.approvedBy,
      approvedAt: budget.approvedAt,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      lines: lines.map((line) => ({
        id: line._id.toString(),
        budgetId: line.budgetId,
        accountId: line.accountId,
        accountName: line.accountName,
        budgetedAmount: line.budgetedAmount,
        actualAmount: line.actualAmount,
        variance: line.variance,
        variancePercentage: line.variancePercentage,
        category: line.category,
      })),
    };
  }

  /**
   * Get all budgets for a business
   */
  static async getBudgets(businessId: string): Promise<Budget[]> {
    const db = await this.getDb();

    const budgets = await db
      .collection("budgets")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();

    const result: Budget[] = [];

    for (const budget of budgets) {
      const lines = await db
        .collection("budget_lines")
        .find({ budgetId: budget._id.toString() })
        .toArray();

      result.push({
        id: budget._id.toString(),
        businessId: budget.businessId,
        budgetName: budget.budgetName,
        budgetType: budget.budgetType,
        startDate: budget.startDate,
        endDate: budget.endDate,
        totalBudget: budget.totalBudget,
        status: budget.status,
        approvedBy: budget.approvedBy,
        approvedAt: budget.approvedAt,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
        lines: lines.map((line) => ({
          id: line._id.toString(),
          budgetId: line.budgetId,
          accountId: line.accountId,
          accountName: line.accountName,
          budgetedAmount: line.budgetedAmount,
          actualAmount: line.actualAmount,
          variance: line.variance,
          variancePercentage: line.variancePercentage,
          category: line.category,
        })),
      });
    }

    return result;
  }

  /**
   * Update budget
   */
  static async updateBudget(
    businessId: string,
    budgetId: string,
    updates: Partial<Budget>,
  ): Promise<Budget> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;

      await clientSession.withTransaction(async () => {
        // Update budget
        const updateData = {
          ...updates,
          updatedAt: new Date(),
        };

        await db
          .collection("budgets")
          .updateOne(
            { _id: new ObjectId(budgetId), businessId },
            { $set: updateData },
          );

        // Update budget lines if provided
        if (updates.lines) {
          // Delete existing lines
          await db.collection("budget_lines").deleteMany({ budgetId });

          // Insert new lines
          const budgetLines = updates.lines.map((line) => ({
            ...line,
            budgetId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));

          await db.collection("budget_lines").insertMany(budgetLines);
        }
      });

      return await this.getBudget(businessId, budgetId);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Approve budget
   */
  static async approveBudget(
    businessId: string,
    budgetId: string,
    approvedBy: string,
  ): Promise<Budget> {
    const db = await this.getDb();

    await db.collection("budgets").updateOne(
      { _id: new ObjectId(budgetId), businessId },
      {
        $set: {
          status: BudgetStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    return await this.getBudget(businessId, budgetId);
  }

  /**
   * Calculate budget variance report
   */
  static async calculateBudgetVariance(
    businessId: string,
    budgetId: string,
    period: DateRange,
  ): Promise<BudgetVarianceReport> {
    const budget = await this.getBudget(businessId, budgetId);

    // Calculate actual amounts for each budget line
    const lineItems: BudgetVarianceLine[] = [];
    let totalBudgeted = 0;
    let totalActual = 0;

    for (const budgetLine of budget.lines) {
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
   * Create forecast
   */
  static async createForecast(
    businessId: string,
    forecastData: Omit<Forecast, "id" | "createdAt">,
  ): Promise<Forecast> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;
      let forecastId: string = "";

      const result = await clientSession.withTransaction(async () => {
        // Create forecast
        const forecast = {
          ...forecastData,
          createdAt: new Date(),
        };

        const forecastResult = await db
          .collection("forecasts")
          .insertOne(forecast);
        forecastId = forecastResult.insertedId.toString();

        // Create forecast lines
        if (forecastData.lines && forecastData.lines.length > 0) {
          const forecastLines = forecastData.lines.map((line) => ({
            ...line,
            forecastId,
            createdAt: new Date(),
          }));

          await db.collection("forecast_lines").insertMany(forecastLines);
        }

        return forecastId;
      });

      // Return the created forecast with lines
      return await this.getForecast(businessId, forecastId);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Get forecast by ID
   */
  static async getForecast(
    businessId: string,
    forecastId: string,
  ): Promise<Forecast> {
    const db = await this.getDb();

    const forecast = await db.collection("forecasts").findOne({
      _id: new ObjectId(forecastId),
      businessId,
    });

    if (!forecast) {
      throw new Error("Forecast not found");
    }

    // Get forecast lines
    const lines = await db
      .collection("forecast_lines")
      .find({ forecastId })
      .toArray();

    return {
      id: forecast._id.toString(),
      businessId: forecast.businessId,
      baseBudgetId: forecast.baseBudgetId,
      forecastName: forecast.forecastName,
      forecastPeriod: forecast.forecastPeriod,
      assumptions: forecast.assumptions,
      createdAt: forecast.createdAt,
      lines: lines.map((line) => ({
        id: line._id.toString(),
        forecastId: line.forecastId,
        accountId: line.accountId,
        forecastedAmount: line.forecastedAmount,
        confidence: line.confidence,
        notes: line.notes,
      })),
    };
  }

  /**
   * Create budget scenario
   */
  static async createBudgetScenario(
    businessId: string,
    scenarioData: Omit<BudgetScenario, "id" | "createdAt">,
  ): Promise<BudgetScenario> {
    const db = await this.getDb();

    const scenario = {
      ...scenarioData,
      createdAt: new Date(),
    };

    const result = await db.collection("budget_scenarios").insertOne(scenario);

    return {
      id: result.insertedId.toString(),
      businessId: scenario.businessId,
      budgetId: scenario.budgetId,
      scenarioName: scenario.scenarioName,
      scenarioType: scenario.scenarioType,
      assumptions: scenario.assumptions,
      results: scenario.results,
      createdAt: scenario.createdAt,
    };
  }

  /**
   * Get budget categories
   */
  static async getBudgetCategories(businessId: string): Promise<any[]> {
    const db = await this.getDb();

    return await db
      .collection("budget_categories")
      .find({ businessId })
      .sort({ name: 1 })
      .toArray();
  }

  /**
   * Create budget category
   */
  static async createBudgetCategory(
    businessId: string,
    categoryData: Omit<any, "id" | "createdAt" | "updatedAt">,
  ): Promise<any> {
    const db = await this.getDb();

    const category = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("budget_categories").insertOne(category);

    return {
      id: result.insertedId.toString(),
      ...category,
    };
  }

  // Private helper methods

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

  /**
   * Update actual amounts for budget lines
   */
  static async updateBudgetActuals(
    businessId: string,
    budgetId: string,
    period: DateRange,
  ): Promise<void> {
    const db = await this.getDb();

    const budget = await this.getBudget(businessId, budgetId);

    for (const budgetLine of budget.lines) {
      const actualAmount = await this.calculateActualAmount(
        businessId,
        budgetLine.accountId,
        period,
      );

      await db.collection("budget_lines").updateOne(
        { _id: new ObjectId(budgetLine.id) },
        {
          $set: {
            actualAmount,
            updatedAt: new Date(),
          },
        },
      );
    }
  }

  /**
   * Get budget summary
   */
  static async getBudgetSummary(businessId: string): Promise<any[]> {
    const db = await this.getDb();

    // Use the budget_summary view if it exists, otherwise calculate manually
    const budgets = await db
      .collection("budgets")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();

    const summary = [];

    for (const budget of budgets) {
      const lines = await db
        .collection("budget_lines")
        .find({ budgetId: budget._id.toString() })
        .toArray();

      const totalBudgeted = lines.reduce(
        (sum, line) => sum + line.budgetedAmount,
        0,
      );
      const totalActual = lines.reduce(
        (sum, line) => sum + line.actualAmount,
        0,
      );
      const totalVariance = totalActual - totalBudgeted;
      const variancePercentage =
        totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

      summary.push({
        id: budget._id.toString(),
        budgetName: budget.budgetName,
        budgetType: budget.budgetType,
        status: budget.status,
        totalBudgeted,
        totalActual,
        totalVariance,
        variancePercentage,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
    }

    return summary;
  }
}
