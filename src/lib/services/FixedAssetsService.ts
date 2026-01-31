import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  FixedAsset,
  AssetCategory,
  DepreciationSchedule,
  ImpairmentTest,
  AssetDisposal,
  AssetRevaluation,
  DepreciationMethod,
  AssetStatus,
  IFRSAssetClassification,
  ImpairmentTestMethod,
  DisposalMethod,
} from "@/types/quickbooks-features";

export class FixedAssetsService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  /**
   * Create a new fixed asset
   */
  static async createFixedAsset(
    businessId: string,
    assetData: Omit<FixedAsset, "id" | "createdAt" | "updatedAt">,
  ): Promise<FixedAsset> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;

      const result = await clientSession.withTransaction(async () => {
        // Create fixed asset
        const asset = {
          ...assetData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const assetResult = await db
          .collection("fixed_assets")
          .insertOne(asset);
        const assetId = assetResult.insertedId.toString();

        // Create initial depreciation schedule
        await this.createInitialDepreciationSchedule(assetId, asset);

        return assetId;
      });

      return await this.getFixedAsset(businessId, result);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Get fixed asset by ID
   */
  static async getFixedAsset(
    businessId: string,
    assetId: string,
  ): Promise<FixedAsset> {
    const db = await this.getDb();

    const asset = await db.collection("fixed_assets").findOne({
      _id: new ObjectId(assetId),
      businessId,
    });

    if (!asset) {
      throw new Error("Fixed asset not found");
    }

    return {
      id: asset._id.toString(),
      businessId: asset.businessId,
      assetNumber: asset.assetNumber,
      description: asset.description,
      categoryId: asset.categoryId,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      depreciationMethod: asset.depreciationMethod,
      usefulLifeYears: asset.usefulLifeYears,
      residualValue: asset.residualValue,
      currentLocation: asset.currentLocation,
      responsiblePerson: asset.responsiblePerson,
      status: asset.status,
      ifrsClassification: asset.ifrsClassification,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }

  /**
   * Get all fixed assets for a business
   */
  static async getFixedAssets(businessId: string): Promise<FixedAsset[]> {
    const db = await this.getDb();

    const assets = await db
      .collection("fixed_assets")
      .find({ businessId })
      .sort({ description: 1 })
      .toArray();

    return assets.map((asset) => ({
      id: asset._id.toString(),
      businessId: asset.businessId,
      assetNumber: asset.assetNumber,
      description: asset.description,
      categoryId: asset.categoryId,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      depreciationMethod: asset.depreciationMethod,
      usefulLifeYears: asset.usefulLifeYears,
      residualValue: asset.residualValue,
      currentLocation: asset.currentLocation,
      responsiblePerson: asset.responsiblePerson,
      status: asset.status,
      ifrsClassification: asset.ifrsClassification,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    }));
  }

  /**
   * Calculate depreciation for an asset
   */
  static async calculateDepreciation(
    assetId: string,
    fiscalYear: number,
  ): Promise<DepreciationSchedule> {
    const db = await this.getDb();

    // Get asset details
    const asset = await db.collection("fixed_assets").findOne({
      _id: new ObjectId(assetId),
    });

    if (!asset) {
      throw new Error("Fixed asset not found");
    }

    // Check if depreciation already exists for this year
    const existingSchedule = await db
      .collection("depreciation_schedules")
      .findOne({
        assetId,
        fiscalYear,
      });

    if (existingSchedule) {
      return {
        id: existingSchedule._id.toString(),
        assetId: existingSchedule.assetId,
        fiscalYear: existingSchedule.fiscalYear,
        openingCarryingAmount: existingSchedule.openingCarryingAmount,
        depreciationExpense: existingSchedule.depreciationExpense,
        closingCarryingAmount: existingSchedule.closingCarryingAmount,
        accumulatedDepreciation: existingSchedule.accumulatedDepreciation,
        calculationDate: existingSchedule.calculationDate,
      };
    }

    // Calculate depreciation based on method
    const depreciationExpense = this.calculateDepreciationExpense(
      asset,
      fiscalYear,
    );

    // Get accumulated depreciation from previous year
    const previousSchedule = await db
      .collection("depreciation_schedules")
      .find({ assetId, fiscalYear: { $lt: fiscalYear } })
      .sort({ fiscalYear: -1 })
      .limit(1)
      .toArray();

    const accumulatedDepreciation =
      previousSchedule.length > 0
        ? previousSchedule[0].accumulatedDepreciation + depreciationExpense
        : depreciationExpense;

    const openingCarryingAmount =
      previousSchedule.length > 0
        ? previousSchedule[0].closingCarryingAmount
        : asset.acquisitionCost;

    const closingCarryingAmount = openingCarryingAmount - depreciationExpense;

    // Create depreciation schedule
    const schedule = {
      assetId,
      fiscalYear,
      openingCarryingAmount,
      depreciationExpense,
      closingCarryingAmount,
      accumulatedDepreciation,
      calculationDate: new Date(),
    };

    const result = await db
      .collection("depreciation_schedules")
      .insertOne(schedule);

    return {
      id: result.insertedId.toString(),
      assetId: schedule.assetId,
      fiscalYear: schedule.fiscalYear,
      openingCarryingAmount: schedule.openingCarryingAmount,
      depreciationExpense: schedule.depreciationExpense,
      closingCarryingAmount: schedule.closingCarryingAmount,
      accumulatedDepreciation: schedule.accumulatedDepreciation,
      calculationDate: schedule.calculationDate,
    };
  }

  /**
   * Perform impairment test
   */
  static async performImpairmentTest(
    assetId: string,
    testDate: Date,
    testMethod: ImpairmentTestMethod,
    recoverableAmount: number,
  ): Promise<ImpairmentTest> {
    const db = await this.getDb();

    // Get asset details
    const asset = await db.collection("fixed_assets").findOne({
      _id: new ObjectId(assetId),
    });

    if (!asset) {
      throw new Error("Fixed asset not found");
    }

    // Get current carrying amount
    const latestSchedule = await db
      .collection("depreciation_schedules")
      .find({ assetId })
      .sort({ fiscalYear: -1 })
      .limit(1)
      .toArray();

    const carryingAmount =
      latestSchedule.length > 0
        ? latestSchedule[0].closingCarryingAmount
        : asset.acquisitionCost;

    // Calculate impairment loss
    const impairmentLoss = Math.max(0, carryingAmount - recoverableAmount);

    // Create impairment test record
    const impairmentTest = {
      assetId,
      testDate,
      carryingAmount,
      recoverableAmount,
      impairmentLoss,
      testMethod,
      performedBy: "system", // TODO: Get from auth context
      createdAt: new Date(),
    };

    const result = await db
      .collection("impairment_tests")
      .insertOne(impairmentTest);

    // Update asset status if impaired
    if (impairmentLoss > 0) {
      await db.collection("fixed_assets").updateOne(
        { _id: new ObjectId(assetId) },
        {
          $set: {
            status: AssetStatus.IMPAIRED,
            updatedAt: new Date(),
          },
        },
      );
    }

    return {
      id: result.insertedId.toString(),
      assetId: impairmentTest.assetId,
      testDate: impairmentTest.testDate,
      carryingAmount: impairmentTest.carryingAmount,
      recoverableAmount: impairmentTest.recoverableAmount,
      impairmentLoss: impairmentTest.impairmentLoss,
      testMethod: impairmentTest.testMethod,
      performedBy: impairmentTest.performedBy,
      createdAt: impairmentTest.createdAt,
    };
  }

  /**
   * Dispose of an asset
   */
  static async disposeAsset(
    assetId: string,
    disposalData: Omit<AssetDisposal, "id" | "createdAt">,
  ): Promise<AssetDisposal> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;

      const result = await clientSession.withTransaction(async () => {
        // Get asset details
        const asset = await db.collection("fixed_assets").findOne({
          _id: new ObjectId(assetId),
        });

        if (!asset) {
          throw new Error("Fixed asset not found");
        }

        // Get current carrying amount
        const latestSchedule = await db
          .collection("depreciation_schedules")
          .find({ assetId })
          .sort({ fiscalYear: -1 })
          .limit(1)
          .toArray();

        const carryingAmount =
          latestSchedule.length > 0
            ? latestSchedule[0].closingCarryingAmount
            : asset.acquisitionCost;

        // Calculate gain/loss on disposal
        const proceedsAmount = disposalData.proceedsAmount || 0;
        const disposalCosts = disposalData.disposalCosts || 0;
        const gainLossOnDisposal =
          proceedsAmount - disposalCosts - carryingAmount;

        // Create disposal record
        const disposal = {
          ...disposalData,
          assetId,
          gainLossOnDisposal,
          disposedBy: "system", // TODO: Get from auth context
          createdAt: new Date(),
        };

        const disposalResult = await db
          .collection("asset_disposals")
          .insertOne(disposal);

        // Update asset status
        await db.collection("fixed_assets").updateOne(
          { _id: new ObjectId(assetId) },
          {
            $set: {
              status: AssetStatus.DISPOSED,
              updatedAt: new Date(),
            },
          },
        );

        return disposalResult.insertedId.toString();
      });

      return await this.getAssetDisposal(result);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Create asset category
   */
  static async createAssetCategory(
    businessId: string,
    categoryData: Omit<AssetCategory, "id" | "createdAt" | "updatedAt">,
  ): Promise<AssetCategory> {
    const db = await this.getDb();

    const category = {
      ...categoryData,
      businessId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("asset_categories").insertOne(category);

    return {
      id: result.insertedId.toString(),
      businessId: category.businessId,
      name: category.name,
      description: category.description,
      depreciationMethod: category.depreciationMethod,
      usefulLifeYears: category.usefulLifeYears,
      ifrsClassification: category.ifrsClassification,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  /**
   * Get asset categories for a business
   */
  static async getAssetCategories(
    businessId: string,
  ): Promise<AssetCategory[]> {
    const db = await this.getDb();

    const categories = await db
      .collection("asset_categories")
      .find({ businessId })
      .sort({ name: 1 })
      .toArray();

    return categories.map((category) => ({
      id: category._id.toString(),
      businessId: category.businessId,
      name: category.name,
      description: category.description,
      depreciationMethod: category.depreciationMethod,
      usefulLifeYears: category.usefulLifeYears,
      ifrsClassification: category.ifrsClassification,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  /**
   * Get depreciation schedules for an asset
   */
  static async getDepreciationSchedules(
    assetId: string,
  ): Promise<DepreciationSchedule[]> {
    const db = await this.getDb();

    const schedules = await db
      .collection("depreciation_schedules")
      .find({ assetId })
      .sort({ fiscalYear: 1 })
      .toArray();

    return schedules.map((schedule) => ({
      id: schedule._id.toString(),
      assetId: schedule.assetId,
      fiscalYear: schedule.fiscalYear,
      openingCarryingAmount: schedule.openingCarryingAmount,
      depreciationExpense: schedule.depreciationExpense,
      closingCarryingAmount: schedule.closingCarryingAmount,
      accumulatedDepreciation: schedule.accumulatedDepreciation,
      calculationDate: schedule.calculationDate,
    }));
  }

  /**
   * Get impairment tests for an asset
   */
  static async getImpairmentTests(assetId: string): Promise<ImpairmentTest[]> {
    const db = await this.getDb();

    const tests = await db
      .collection("impairment_tests")
      .find({ assetId })
      .sort({ testDate: -1 })
      .toArray();

    return tests.map((test) => ({
      id: test._id.toString(),
      assetId: test.assetId,
      testDate: test.testDate,
      carryingAmount: test.carryingAmount,
      recoverableAmount: test.recoverableAmount,
      impairmentLoss: test.impairmentLoss,
      testMethod: test.testMethod,
      performedBy: test.performedBy,
      createdAt: test.createdAt,
    }));
  }

  // Private helper methods

  private static async createInitialDepreciationSchedule(
    assetId: string,
    asset: any,
  ): Promise<void> {
    const db = await this.getDb();

    const currentYear = new Date().getFullYear();
    const depreciationExpense = this.calculateDepreciationExpense(
      asset,
      currentYear,
    );

    const schedule = {
      assetId,
      fiscalYear: currentYear,
      openingCarryingAmount: asset.acquisitionCost,
      depreciationExpense,
      closingCarryingAmount: asset.acquisitionCost - depreciationExpense,
      accumulatedDepreciation: depreciationExpense,
      calculationDate: new Date(),
    };

    await db.collection("depreciation_schedules").insertOne(schedule);
  }

  private static calculateDepreciationExpense(
    asset: any,
    fiscalYear: number,
  ): number {
    const {
      acquisitionCost,
      residualValue,
      usefulLifeYears,
      depreciationMethod,
      acquisitionDate,
    } = asset;

    const yearsInUse = fiscalYear - acquisitionDate.getFullYear();

    if (yearsInUse < 0 || yearsInUse >= usefulLifeYears) {
      return 0;
    }

    const depreciableAmount = acquisitionCost - residualValue;

    switch (depreciationMethod) {
      case DepreciationMethod.STRAIGHT_LINE:
        return depreciableAmount / usefulLifeYears;

      case DepreciationMethod.DECLINING_BALANCE:
        // Double declining balance
        const rate = 2 / usefulLifeYears;
        const accumulatedDepreciation =
          yearsInUse * (depreciableAmount / usefulLifeYears);
        const bookValue = Math.max(
          residualValue,
          acquisitionCost - accumulatedDepreciation,
        );
        return bookValue * rate;

      case DepreciationMethod.SUM_OF_YEARS:
        // Sum of the years' digits
        const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2;
        const remainingLife = usefulLifeYears - yearsInUse;
        return (depreciableAmount * remainingLife) / sumOfYears;

      case DepreciationMethod.UNITS_OF_PRODUCTION:
        // This would require production data - simplified for now
        return depreciableAmount / usefulLifeYears;

      default:
        return depreciableAmount / usefulLifeYears;
    }
  }

  private static async getAssetDisposal(
    disposalId: string,
  ): Promise<AssetDisposal> {
    const db = await this.getDb();

    const disposal = await db.collection("asset_disposals").findOne({
      _id: new ObjectId(disposalId),
    });

    if (!disposal) {
      throw new Error("Asset disposal not found");
    }

    return {
      id: disposal._id.toString(),
      assetId: disposal.assetId,
      disposalDate: disposal.disposalDate,
      disposalMethod: disposal.disposalMethod,
      proceedsAmount: disposal.proceedsAmount,
      disposalCosts: disposal.disposalCosts,
      gainLossOnDisposal: disposal.gainLossOnDisposal,
      buyerName: disposal.buyerName,
      disposalReference: disposal.disposalReference,
      disposedBy: disposal.disposedBy,
      createdAt: disposal.createdAt,
    };
  }

  /**
   * Get asset summary for dashboard
   */
  static async getAssetSummary(businessId: string): Promise<any[]> {
    const db = await this.getDb();

    // Use the asset_summary view if it exists, otherwise calculate manually
    const assets = await db
      .collection("fixed_assets")
      .find({ businessId })
      .toArray();

    const summary = [];

    for (const asset of assets) {
      const schedules = await db
        .collection("depreciation_schedules")
        .find({ assetId: asset._id.toString() })
        .sort({ fiscalYear: -1 })
        .limit(1)
        .toArray();

      const latestSchedule = schedules[0];

      summary.push({
        id: asset._id.toString(),
        assetNumber: asset.assetNumber,
        description: asset.description,
        acquisitionCost: asset.acquisitionCost,
        currentCarryingAmount: latestSchedule
          ? latestSchedule.closingCarryingAmount
          : asset.acquisitionCost,
        accumulatedDepreciation: latestSchedule
          ? latestSchedule.accumulatedDepreciation
          : 0,
        netBookValue: latestSchedule
          ? latestSchedule.closingCarryingAmount
          : asset.acquisitionCost,
        acquisitionDate: asset.acquisitionDate,
        usefulLifeYears: asset.usefulLifeYears,
        ageInYears: Math.floor(
          (new Date().getTime() - new Date(asset.acquisitionDate).getTime()) /
            (365 * 24 * 60 * 60 * 1000),
        ),
        status: asset.status,
      });
    }

    return summary;
  }

  /**
   * Revalue an asset
   */
  static async revalueAsset(
    assetId: string,
    revaluationData: Omit<AssetRevaluation, "id" | "createdAt">,
  ): Promise<AssetRevaluation> {
    const db = await this.getDb();

    // Get asset details
    const asset = await db.collection("fixed_assets").findOne({
      _id: new ObjectId(assetId),
    });

    if (!asset) {
      throw new Error("Fixed asset not found");
    }

    // Calculate revaluation surplus
    const revaluationSurplus =
      revaluationData.revaluedAmount - revaluationData.previousCarryingAmount;

    // Create revaluation record
    const revaluation = {
      ...revaluationData,
      assetId,
      revaluationSurplus,
      performedBy: "system", // TODO: Get from auth context
      createdAt: new Date(),
    };

    const result = await db
      .collection("asset_revaluations")
      .insertOne(revaluation);

    return {
      id: result.insertedId.toString(),
      assetId: revaluation.assetId,
      revaluationDate: revaluation.revaluationDate,
      previousCarryingAmount: revaluation.previousCarryingAmount,
      revaluedAmount: revaluation.revaluedAmount,
      revaluationSurplus: revaluation.revaluationSurplus,
      valuationMethod: revaluation.valuationMethod,
      valuerName: revaluation.valuerName,
      performedBy: revaluation.performedBy,
      createdAt: revaluation.createdAt,
    };
  }

  /**
   * Get asset revaluations
   */
  static async getAssetRevaluations(
    assetId: string,
  ): Promise<AssetRevaluation[]> {
    const db = await this.getDb();

    const revaluations = await db
      .collection("asset_revaluations")
      .find({ assetId })
      .sort({ revaluationDate: -1 })
      .toArray();

    return revaluations.map((revaluation) => ({
      id: revaluation._id.toString(),
      assetId: revaluation.assetId,
      revaluationDate: revaluation.revaluationDate,
      previousCarryingAmount: revaluation.previousCarryingAmount,
      revaluedAmount: revaluation.revaluedAmount,
      revaluationSurplus: revaluation.revaluationSurplus,
      valuationMethod: revaluation.valuationMethod,
      valuerName: revaluation.valuerName,
      performedBy: revaluation.performedBy,
      createdAt: revaluation.createdAt,
    }));
  }
}
