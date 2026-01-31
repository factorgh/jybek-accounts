"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { InventoryItem, ReorderSuggestion } from "@/types/quickbooks-features";

interface InventoryDashboardProps {
  businessId: string;
}

export function InventoryDashboard({ businessId }: InventoryDashboardProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [reorderSuggestions, setReorderSuggestions] = useState<
    ReorderSuggestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockItems: InventoryItem[] = [
    {
      id: "1",
      businessId,
      itemCode: "ITEM001",
      description: "Office Laptop Computer",
      categoryId: "cat1",
      unitOfMeasure: "Each",
      costMethod: "FIFO" as any,
      currentStock: 25,
      reorderPoint: 10,
      maxStock: 50,
      unitCost: 899.99,
      sellingPrice: 1299.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      businessId,
      itemCode: "ITEM002",
      description: "Wireless Mouse",
      categoryId: "cat1",
      unitOfMeasure: "Each",
      costMethod: "FIFO" as any,
      currentStock: 8,
      reorderPoint: 15,
      maxStock: 40,
      unitCost: 25.5,
      sellingPrice: 45.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      businessId,
      itemCode: "ITEM003",
      description: "Desk Chair",
      categoryId: "cat2",
      unitOfMeasure: "Each",
      costMethod: "WEIGHTED_AVERAGE" as any,
      currentStock: 45,
      reorderPoint: 20,
      maxStock: 60,
      unitCost: 150.0,
      sellingPrice: 249.99,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockReorderSuggestions: ReorderSuggestion[] = [
    {
      itemId: "2",
      itemCode: "ITEM002",
      description: "Wireless Mouse",
      currentStock: 8,
      reorderPoint: 15,
      suggestedQuantity: 25,
      urgency: "high",
      estimatedCost: 637.5,
    },
  ];

  useEffect(() => {
    // Load mock data
    setItems(mockItems);
    setReorderSuggestions(mockReorderSuggestions);
  }, [businessId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0)
      return { status: "out", color: "destructive", label: "Out of Stock" };
    if (item.currentStock <= item.reorderPoint)
      return { status: "low", color: "destructive", label: "Low Stock" };
    if (item.currentStock >= item.maxStock * 0.8)
      return { status: "high", color: "default", label: "High Stock" };
    return { status: "normal", color: "default", label: "In Stock" };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate summary metrics
  const totalItems = items.length;
  const totalValue = items.reduce(
    (sum, item) => sum + item.currentStock * item.unitCost,
    0,
  );
  const lowStockItems = items.filter(
    (item) => item.currentStock <= item.reorderPoint,
  ).length;
  const outOfStockItems = items.filter(
    (item) => item.currentStock === 0,
  ).length;

  const filteredItems = items.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h2>
          <p className="text-gray-600">
            Track and manage your inventory stock levels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Refreshing inventory data...")}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Exporting inventory data...")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => alert("Add new inventory item")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventory Management
            </h1>
            <p className="text-gray-600">
              Track and manage your inventory items and stock levels
            </p>
          </div>
          <Button onClick={() => alert("Add new inventory item")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Items</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
              <div className="p-3 bg-red-400 bg-opacity-30 rounded-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="items" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Suggestions</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    alert("Filter options: Category, Status, Stock Level")
                  }
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items ({filteredItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Item Code
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Unit Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Total Value
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item);
                      const totalValue = item.currentStock * item.unitCost;

                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {item.itemCode}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">{item.description}</p>
                            <p className="text-sm text-gray-600">
                              {item.unitOfMeasure}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {item.currentStock}
                              </span>
                              {item.reorderPoint && (
                                <span className="text-sm text-gray-500">
                                  (Min: {item.reorderPoint})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              {formatCurrency(item.unitCost)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(totalValue)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  alert(
                                    `Adjust stock for ${item.itemCode}: ${item.description}`,
                                  )
                                }
                              >
                                Adjust
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  alert(
                                    `View history for ${item.itemCode}: ${item.description}`,
                                  )
                                }
                              >
                                History
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Reorder Suggestions
                <Badge variant="outline">
                  {reorderSuggestions.length} items need reordering
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reorderSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {reorderSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${getUrgencyColor(suggestion.urgency)}`}
                        >
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {suggestion.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {suggestion.itemCode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-medium text-red-600">
                            {suggestion.currentStock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Reorder Point</p>
                          <p className="font-medium">
                            {suggestion.reorderPoint}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Suggested Qty</p>
                          <p className="font-medium">
                            {suggestion.suggestedQuantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Est. Cost</p>
                          <p className="font-medium">
                            {formatCurrency(suggestion.estimatedCost)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              suggestion.urgency === "critical"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {suggestion.urgency}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() =>
                              alert(
                                `Order ${suggestion.suggestedQuantity} units of ${suggestion.itemCode}: ${suggestion.description}\nEstimated Cost: ${formatCurrency(suggestion.estimatedCost)}`,
                              )
                            }
                          >
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Reorder Suggestions
                  </h3>
                  <p className="text-gray-600">
                    All items have adequate stock levels
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Stock Movement History
                </h3>
                <p className="text-gray-600 mb-4">
                  View detailed inventory movement history
                </p>
                <Button
                  variant="outline"
                  onClick={() => alert("Refreshing stock movement history...")}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
