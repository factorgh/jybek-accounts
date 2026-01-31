import { Db, ObjectId, ClientSession } from "mongodb";
import clientPromise from "@/lib/db/mongodb";
import {
  InventoryItem,
  InventoryMovement,
  StockLevel,
  InventoryValuation,
  ReorderRule,
  ReorderSuggestion,
  CostMethod,
  MovementType,
  ReferenceType,
} from "@/types/quickbooks-features";

export class InventoryService {
  private static getDb(): Promise<Db> {
    return clientPromise.then((client) => client.db("jybek_accounts"));
  }

  /**
   * Create a new inventory item
   */
  static async createInventoryItem(
    businessId: string,
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<InventoryItem> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;
      let itemId: string = "";

      const result = await clientSession.withTransaction(async () => {
        // Create inventory item
        const item = {
          ...itemData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const itemResult = await db
          .collection("inventory_items")
          .insertOne(item);
        itemId = itemResult.insertedId.toString();

        // Create initial stock level
        const stockLevel = {
          itemId,
          warehouseLocation: "Main",
          quantityOnHand: itemData.currentStock || 0,
          quantityReserved: 0,
          lastUpdated: new Date(),
        };

        await db.collection("stock_levels").insertOne(stockLevel);

        return itemId;
      });

      return await this.getInventoryItem(businessId, itemId);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Get inventory item by ID
   */
  static async getInventoryItem(
    businessId: string,
    itemId: string,
  ): Promise<InventoryItem> {
    const db = await this.getDb();

    const item = await db.collection("inventory_items").findOne({
      _id: new ObjectId(itemId),
      businessId,
    });

    if (!item) {
      throw new Error("Inventory item not found");
    }

    return {
      id: item._id.toString(),
      businessId: item.businessId,
      itemCode: item.itemCode,
      description: item.description,
      categoryId: item.categoryId,
      unitOfMeasure: item.unitOfMeasure,
      costMethod: item.costMethod,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      maxStock: item.maxStock,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * Get all inventory items for a business
   */
  static async getInventoryItems(businessId: string): Promise<InventoryItem[]> {
    const db = await this.getDb();

    const items = await db
      .collection("inventory_items")
      .find({ businessId, isActive: true })
      .sort({ description: 1 })
      .toArray();

    return items.map((item) => ({
      id: item._id.toString(),
      businessId: item.businessId,
      itemCode: item.itemCode,
      description: item.description,
      categoryId: item.categoryId,
      unitOfMeasure: item.unitOfMeasure,
      costMethod: item.costMethod,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      maxStock: item.maxStock,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  /**
   * Adjust inventory stock
   */
  static async adjustStock(
    businessId: string,
    itemId: string,
    quantity: number,
    movementType: MovementType,
    reason: string,
    referenceType?: ReferenceType,
    referenceId?: string,
    warehouseLocation: string = "Main",
  ): Promise<InventoryMovement> {
    const db = await this.getDb();
    const session = clientPromise.then((client) => client.startSession());

    try {
      const clientSession = await session;
      let movementId: string = "";

      const result = await clientSession.withTransaction(async () => {
        // Get current item details
        const item = await db.collection("inventory_items").findOne({
          _id: new ObjectId(itemId),
          businessId,
        });

        if (!item) {
          throw new Error("Inventory item not found");
        }

        // Calculate total cost
        const unitCost = movementType === MovementType.IN ? item.unitCost : 0;
        const totalCost = Math.abs(quantity) * unitCost;

        // Create inventory movement
        const movement = {
          itemId,
          movementType,
          quantity,
          unitCost,
          totalCost,
          referenceType,
          referenceId,
          movementDate: new Date(),
          warehouseLocation,
          notes: reason,
          createdAt: new Date(),
        };

        const movementResult = await db
          .collection("inventory_movements")
          .insertOne(movement);
        movementId = movementResult.insertedId.toString();

        // Update stock levels
        const stockLevel = await db.collection("stock_levels").findOne({
          itemId,
          warehouseLocation,
        });

        if (stockLevel) {
          const newQuantityOnHand = stockLevel.quantityOnHand + quantity;

          await db.collection("stock_levels").updateOne(
            { _id: stockLevel._id },
            {
              $set: {
                quantityOnHand: newQuantityOnHand,
                lastUpdated: new Date(),
              },
            },
          );

          // Update item's current stock
          await db.collection("inventory_items").updateOne(
            { _id: new ObjectId(itemId) },
            {
              $set: {
                currentStock: newQuantityOnHand,
                updatedAt: new Date(),
              },
            },
          );
        } else {
          // Create new stock level if it doesn't exist
          await db.collection("stock_levels").insertOne({
            itemId,
            warehouseLocation,
            quantityOnHand: quantity,
            quantityReserved: 0,
            lastUpdated: new Date(),
          });
        }

        return movementId;
      });

      return await this.getInventoryMovement(movementId);
    } finally {
      const clientSession = await session;
      await clientSession.endSession();
    }
  }

  /**
   * Get inventory movement by ID
   */
  static async getInventoryMovement(
    movementId: string,
  ): Promise<InventoryMovement> {
    const db = await this.getDb();

    const movement = await db.collection("inventory_movements").findOne({
      _id: new ObjectId(movementId),
    });

    if (!movement) {
      throw new Error("Inventory movement not found");
    }

    return {
      id: movement._id.toString(),
      itemId: movement.itemId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      unitCost: movement.unitCost,
      totalCost: movement.totalCost,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      movementDate: movement.movementDate,
      notes: movement.notes,
      createdAt: movement.createdAt,
    };
  }

  /**
   * Get inventory movements for an item
   */
  static async getInventoryMovements(
    businessId: string,
    itemId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InventoryMovement[]> {
    const db = await this.getDb();

    const query: any = {};

    if (itemId) {
      query.itemId = itemId;
    }

    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) query.movementDate.$gte = startDate;
      if (endDate) query.movementDate.$lte = endDate;
    }

    const movements = await db
      .collection("inventory_movements")
      .find(query)
      .sort({ movementDate: -1 })
      .toArray();

    return movements.map((movement) => ({
      id: movement._id.toString(),
      itemId: movement.itemId,
      movementType: movement.movementType,
      quantity: movement.quantity,
      unitCost: movement.unitCost,
      totalCost: movement.totalCost,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      movementDate: movement.movementDate,
      warehouseLocation: movement.warehouseLocation,
      notes: movement.notes,
      createdAt: movement.createdAt,
    }));
  }

  /**
   * Calculate Cost of Goods Sold (COGS)
   */
  static async calculateCOGS(
    businessId: string,
    itemId: string,
    period: { startDate: Date; endDate: Date },
  ): Promise<number> {
    const db = await this.getDb();

    // Get all outgoing movements for the period
    const movements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.OUT,
        movementDate: { $gte: period.startDate, $lte: period.endDate },
      })
      .toArray();

    // Get item cost method
    const item = await db.collection("inventory_items").findOne({
      _id: new ObjectId(itemId),
      businessId,
    });

    if (!item) {
      throw new Error("Inventory item not found");
    }

    let totalCOGS = 0;

    if (item.costMethod === CostMethod.FIFO) {
      // FIFO: Calculate based on earliest purchases
      totalCOGS = await this.calculateFIFOCOGS(itemId, movements, period);
    } else if (item.costMethod === CostMethod.LIFO) {
      // LIFO: Calculate based on latest purchases
      totalCOGS = await this.calculateLIFOCOGS(itemId, movements, period);
    } else if (item.costMethod === CostMethod.WEIGHTED_AVERAGE) {
      // Weighted Average: Use average cost
      totalCOGS = movements.reduce(
        (sum, movement) => sum + (movement.totalCost || 0),
        0,
      );
    } else {
      // Specific Identification: Use specific costs
      totalCOGS = movements.reduce(
        (sum, movement) => sum + (movement.totalCost || 0),
        0,
      );
    }

    return totalCOGS;
  }

  /**
   * Value inventory using specified method
   */
  static async valueInventory(
    businessId: string,
    valuationMethod: CostMethod,
    asOfDate: Date,
  ): Promise<InventoryValuation> {
    const db = await this.getDb();

    const items = await db
      .collection("inventory_items")
      .find({ businessId, isActive: true })
      .toArray();

    let totalValue = 0;
    const itemValuations = [];

    for (const item of items) {
      const stockLevel = await db.collection("stock_levels").findOne({
        itemId: item._id.toString(),
        warehouseLocation: "Main",
      });

      const quantity = stockLevel?.quantityOnHand || 0;
      let unitValue = 0;

      if (valuationMethod === CostMethod.FIFO) {
        unitValue = await this.getFIFOUnitValue(item._id.toString(), asOfDate);
      } else if (valuationMethod === CostMethod.LIFO) {
        unitValue = await this.getLIFOUnitValue(item._id.toString(), asOfDate);
      } else if (valuationMethod === CostMethod.WEIGHTED_AVERAGE) {
        unitValue = await this.getWeightedAverageUnitValue(
          item._id.toString(),
          asOfDate,
        );
      } else {
        unitValue = item.unitCost || 0;
      }

      const itemValue = quantity * unitValue;
      totalValue += itemValue;

      itemValuations.push({
        itemId: item._id.toString(),
        quantity,
        unitValue,
        totalValue: itemValue,
      });
    }

    // Save valuation record
    const valuation = {
      businessId,
      valuationDate: asOfDate,
      valuationMethod,
      totalValue,
      itemCount: items.length,
      createdAt: new Date(),
    };

    const result = await db
      .collection("inventory_valuations")
      .insertOne(valuation);

    return {
      id: result.insertedId.toString(),
      businessId,
      valuationDate: asOfDate,
      valuationMethod,
      totalValue,
      itemValuations,
    };
  }

  /**
   * Generate reorder suggestions
   */
  static async generateReorderSuggestions(
    businessId: string,
  ): Promise<ReorderSuggestion[]> {
    const db = await this.getDb();

    const suggestions: ReorderSuggestion[] = [];

    // Get items with reorder rules
    const itemsWithRules = await db
      .collection("inventory_items")
      .aggregate([
        {
          $match: { businessId, isActive: true },
        },
        {
          $lookup: {
            from: "stock_levels",
            localField: "_id",
            foreignField: "itemId",
            as: "stockLevels",
          },
        },
        {
          $lookup: {
            from: "reorder_rules",
            localField: "_id",
            foreignField: "itemId",
            as: "reorderRules",
          },
        },
        {
          $match: {
            "reorderRules.isActive": true,
          },
        },
      ])
      .toArray();

    for (const item of itemsWithRules) {
      const stockLevel = item.stockLevels.find(
        (sl: any) => sl.warehouseLocation === "Main",
      );
      const reorderRule = item.reorderRules.find((rr: any) => rr.isActive);

      if (stockLevel && reorderRule) {
        const availableStock =
          stockLevel.quantityAvailable || stockLevel.quantityOnHand;

        if (availableStock <= reorderRule.reorderPoint) {
          const urgency = this.calculateReorderUrgency(
            availableStock,
            reorderRule.reorderPoint,
          );
          const estimatedCost =
            reorderRule.reorderQuantity * (item.unitCost || 0);

          suggestions.push({
            itemId: item._id.toString(),
            itemCode: item.itemCode,
            description: item.description,
            currentStock: availableStock,
            reorderPoint: reorderRule.reorderPoint,
            suggestedQuantity: reorderRule.reorderQuantity,
            urgency,
            estimatedCost,
          });
        }
      }
    }

    return suggestions.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * Create reorder rule
   */
  static async createReorderRule(
    businessId: string,
    ruleData: Omit<ReorderRule, "id" | "createdAt" | "updatedAt">,
  ): Promise<ReorderRule> {
    const db = await this.getDb();

    const rule = {
      ...ruleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("reorder_rules").insertOne(rule);

    return {
      id: result.insertedId.toString(),
      businessId: rule.businessId,
      itemId: rule.itemId,
      reorderPoint: rule.reorderPoint,
      reorderQuantity: rule.reorderQuantity,
      leadTimeDays: rule.leadTimeDays,
      safetyStock: rule.safetyStock,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
    };
  }

  // Private helper methods

  private static async calculateFIFOCOGS(
    itemId: string,
    movements: any[],
    period: { startDate: Date; endDate: Date },
  ): Promise<number> {
    const db = await this.getDb();

    // Get all incoming movements before the period start date
    const incomingMovements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.IN,
        movementDate: { $lt: period.startDate },
      })
      .sort({ movementDate: 1 })
      .toArray();

    // Create queue of available inventory with costs
    const inventoryQueue: Array<{ quantity: number; unitCost: number }> = [];

    incomingMovements.forEach((movement) => {
      inventoryQueue.push({
        quantity: movement.quantity,
        unitCost: movement.unitCost || 0,
      });
    });

    let totalCOGS = 0;

    // Calculate COGS for each outgoing movement
    for (const movement of movements) {
      let remainingQuantity = Math.abs(movement.quantity);
      let movementCOGS = 0;

      while (remainingQuantity > 0 && inventoryQueue.length > 0) {
        const oldestBatch = inventoryQueue[0];
        const quantityToUse = Math.min(remainingQuantity, oldestBatch.quantity);

        movementCOGS += quantityToUse * oldestBatch.unitCost;
        remainingQuantity -= quantityToUse;
        oldestBatch.quantity -= quantityToUse;

        if (oldestBatch.quantity <= 0) {
          inventoryQueue.shift();
        }
      }

      totalCOGS += movementCOGS;
    }

    return totalCOGS;
  }

  private static async calculateLIFOCOGS(
    itemId: string,
    movements: any[],
    period: { startDate: Date; endDate: Date },
  ): Promise<number> {
    const db = await this.getDb();

    // Get all incoming movements before the period start date
    const incomingMovements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.IN,
        movementDate: { $lt: period.startDate },
      })
      .sort({ movementDate: -1 })
      .toArray();

    // Create stack of available inventory with costs
    const inventoryStack: Array<{ quantity: number; unitCost: number }> = [];

    incomingMovements.forEach((movement) => {
      inventoryStack.push({
        quantity: movement.quantity,
        unitCost: movement.unitCost || 0,
      });
    });

    let totalCOGS = 0;

    // Calculate COGS for each outgoing movement
    for (const movement of movements) {
      let remainingQuantity = Math.abs(movement.quantity);
      let movementCOGS = 0;

      while (remainingQuantity > 0 && inventoryStack.length > 0) {
        const latestBatch = inventoryStack[0];
        const quantityToUse = Math.min(remainingQuantity, latestBatch.quantity);

        movementCOGS += quantityToUse * latestBatch.unitCost;
        remainingQuantity -= quantityToUse;
        latestBatch.quantity -= quantityToUse;

        if (latestBatch.quantity <= 0) {
          inventoryStack.shift();
        }
      }

      totalCOGS += movementCOGS;
    }

    return totalCOGS;
  }

  private static async getFIFOUnitValue(
    itemId: string,
    asOfDate: Date,
  ): Promise<number> {
    const db = await this.getDb();

    const movements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.IN,
        movementDate: { $lte: asOfDate },
      })
      .sort({ movementDate: 1 })
      .toArray();

    if (movements.length === 0) return 0;

    // Calculate weighted average of all incoming costs
    const totalCost = movements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  private static async getLIFOUnitValue(
    itemId: string,
    asOfDate: Date,
  ): Promise<number> {
    const db = await this.getDb();

    const movements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.IN,
        movementDate: { $lte: asOfDate },
      })
      .sort({ movementDate: -1 })
      .toArray();

    if (movements.length === 0) return 0;

    // Return the most recent unit cost
    return movements[0]?.unitCost || 0;
  }

  private static async getWeightedAverageUnitValue(
    itemId: string,
    asOfDate: Date,
  ): Promise<number> {
    const db = await this.getDb();

    const movements = await db
      .collection("inventory_movements")
      .find({
        itemId,
        movementType: MovementType.IN,
        movementDate: { $lte: asOfDate },
      })
      .toArray();

    if (movements.length === 0) return 0;

    const totalCost = movements.reduce((sum, m) => sum + (m.totalCost || 0), 0);
    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  private static calculateReorderUrgency(
    currentStock: number,
    reorderPoint: number,
  ): "low" | "medium" | "high" | "critical" {
    const ratio = currentStock / reorderPoint;

    if (ratio <= 0) return "critical";
    if (ratio <= 0.25) return "high";
    if (ratio <= 0.5) return "medium";
    return "low";
  }

  /**
   * Get inventory summary
   */
  static async getInventorySummary(businessId: string): Promise<any[]> {
    const db = await this.getDb();

    // Use the inventory_summary view if it exists, otherwise calculate manually
    const items = await db
      .collection("inventory_items")
      .find({ businessId, isActive: true })
      .toArray();

    const summary = [];

    for (const item of items) {
      const stockLevel = await db.collection("stock_levels").findOne({
        itemId: item._id.toString(),
        warehouseLocation: "Main",
      });

      const reorderRule = await db.collection("reorder_rules").findOne({
        itemId: item._id.toString(),
        isActive: true,
      });

      const availableStock =
        stockLevel?.quantityAvailable || stockLevel?.quantityOnHand || 0;
      const totalValue = availableStock * (item.unitCost || 0);
      const needsReorder =
        reorderRule && availableStock <= reorderRule.reorderPoint;

      summary.push({
        id: item._id.toString(),
        itemCode: item.itemCode,
        description: item.description,
        currentStock: item.currentStock,
        availableStock,
        totalValue,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        reorderPoint: reorderRule?.reorderPoint,
        needsReorder,
      });
    }

    return summary;
  }
}
