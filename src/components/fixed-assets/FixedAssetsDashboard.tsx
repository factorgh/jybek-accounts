"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  Settings,
  Calculator,
  Trash2,
  Hammer,
} from "lucide-react";
import {
  FixedAsset,
  DepreciationMethod,
  AssetStatus,
  IFRSAssetClassification,
  ImpairmentTestMethod,
  DepreciationSchedule,
  ImpairmentTest,
} from "@/types/quickbooks-features";

interface FixedAssetsDashboardProps {
  businessId: string;
}

export function FixedAssetsDashboard({
  businessId,
}: FixedAssetsDashboardProps) {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [depreciationSchedules, setDepreciationSchedules] = useState<
    DepreciationSchedule[]
  >([]);
  const [impairmentTests, setImpairmentTests] = useState<ImpairmentTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockAssets: FixedAsset[] = [
    {
      id: "1",
      businessId,
      assetNumber: "FA001",
      description: "Office Building - Main Floor",
      categoryId: "cat1",
      acquisitionDate: new Date("2020-01-15"),
      acquisitionCost: 500000,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      usefulLifeYears: 10,
      residualValue: 5000,
      currentLocation: "Main Office",
      responsiblePerson: "John Doe",
      status: AssetStatus.ACTIVE,
      ifrsClassification: IFRSAssetClassification.PPE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      businessId,
      assetNumber: "FA002",
      description: "Delivery Van",
      categoryId: "cat2",
      acquisitionDate: new Date("2022-03-20"),
      acquisitionCost: 45000,
      depreciationMethod: DepreciationMethod.DECLINING_BALANCE,
      usefulLifeYears: 5,
      residualValue: 2000,
      currentLocation: "Warehouse",
      responsiblePerson: "Jane Smith",
      status: AssetStatus.ACTIVE,
      ifrsClassification: IFRSAssetClassification.PPE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      businessId,
      assetNumber: "FA003",
      description: "Computer Equipment",
      categoryId: "cat3",
      acquisitionDate: new Date("2023-01-10"),
      acquisitionCost: 15000,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      usefulLifeYears: 3,
      residualValue: 500,
      currentLocation: "Office",
      responsiblePerson: "Mike Johnson",
      status: AssetStatus.ACTIVE,
      ifrsClassification: IFRSAssetClassification.PPE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "4",
      businessId,
      assetNumber: "FA004",
      description: "Manufacturing Machine",
      categoryId: "cat4",
      acquisitionDate: new Date("2021-06-15"),
      acquisitionCost: 120000,
      depreciationMethod: DepreciationMethod.SUM_OF_YEARS,
      usefulLifeYears: 15,
      residualValue: 10000,
      currentLocation: "Factory Floor",
      responsiblePerson: "Sarah Wilson",
      status: AssetStatus.IMPAIRED,
      ifrsClassification: IFRSAssetClassification.PPE,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockDepreciationSchedules: DepreciationSchedule[] = [
    {
      id: "1",
      assetId: "1",
      fiscalYear: 2024,
      openingCarryingAmount: 475000,
      depreciationExpense: 15000,
      closingCarryingAmount: 460000,
      accumulatedDepreciation: 40000,
      calculationDate: new Date("2024-01-01"),
    },
    {
      id: "2",
      assetId: "2",
      fiscalYear: 2024,
      openingCarryingAmount: 33750,
      depreciationExpense: 5625,
      closingCarryingAmount: 28125,
      accumulatedDepreciation: 16875,
      calculationDate: new Date("2024-01-01"),
    },
  ];

  const mockImpairmentTests: ImpairmentTest[] = [
    {
      id: "1",
      assetId: "4",
      testDate: new Date("2024-03-15"),
      carryingAmount: 85000,
      recoverableAmount: 70000,
      impairmentLoss: 15000,
      testMethod: ImpairmentTestMethod.VALUE_IN_USE,
      performedBy: "System",
      createdAt: new Date("2024-03-15"),
    },
  ];

  useEffect(() => {
    // Load mock data
    setAssets(mockAssets);
    setDepreciationSchedules(mockDepreciationSchedules);
    setImpairmentTests(mockImpairmentTests);
  }, [businessId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "disposed":
        return "bg-gray-500";
      case "impaired":
        return "bg-orange-500";
      case "retired":
        return "bg-red-500";
      case "under_construction":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "disposed":
        return "Disposed";
      case "impaired":
        return "Impaired";
      case "retired":
        return "Retired";
      case "under_construction":
        return "Under Construction";
      default:
        return status;
    }
  };

  const getDepreciationMethodLabel = (method: string) => {
    switch (method) {
      case "straight_line":
        return "Straight Line";
      case "declining_balance":
        return "Declining Balance";
      case "sum_of_years":
        return "Sum of Years";
      case "units_of_production":
        return "Units of Production";
      default:
        return method;
    }
  };

  // Calculate summary metrics
  const totalAssets = assets.length;
  const totalValue = assets.reduce(
    (sum, asset) => sum + asset.acquisitionCost,
    0,
  );
  const impairedAssets = assets.filter(
    (asset) => asset.status === "impaired",
  ).length;
  const disposedAssets = assets.filter(
    (asset) => asset.status === "disposed",
  ).length;

  const filteredAssets = assets.filter(
    (asset) =>
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fixed Assets</h2>
          <p className="text-gray-600">
            Manage and track fixed assets with depreciation and impairment
            testing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Depreciation
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Assets</p>
                <p className="text-2xl font-bold">{totalAssets}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <Building className="h-6 w-6 text-white" />
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
                <p className="text-orange-100 text-sm">Impaired Assets</p>
                <p className="text-2xl font-bold">{impairedAssets}</p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Disposed Assets</p>
                <p className="text-2xl font-bold">{disposedAssets}</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="impairment">Impairment</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fixed Assets ({filteredAssets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Asset #
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Description
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Acquisition Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Method
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Useful Life
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
                    {filteredAssets.map((asset) => {
                      const ageInYears = Math.floor(
                        (new Date().getTime() -
                          new Date(asset.acquisitionDate).getTime()) /
                          (365 * 24 * 60 * 60 * 1000),
                      );

                      return (
                        <tr
                          key={asset.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {asset.assetNumber}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-gray-900">
                                {asset.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                {asset.currentLocation}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              {formatCurrency(asset.acquisitionCost)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(asset.acquisitionDate)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              {getDepreciationMethodLabel(
                                asset.depreciationMethod,
                              )}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-gray-900">
                                {asset.usefulLifeYears} years
                              </p>
                              <p className="text-sm text-gray-600">
                                {ageInYears} years old
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              <div className={`flex items-center space-x-1`}>
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)}`}
                                />
                                <span>{getStatusLabel(asset.status)}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calculator className="h-4 w-4 mr-2" />
                                Depreciate
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

        <TabsContent value="depreciation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Depreciation Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {depreciationSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-lg bg-blue-500">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Fiscal Year {schedule.fiscalYear}
                        </p>
                        <p className="text-sm text-gray-600">
                          Asset ID: {schedule.assetId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Depreciation Expense
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(schedule.depreciationExpense)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Closing Carrying Amount
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(schedule.closingCarryingAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Accumulated Depreciation
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(schedule.accumulatedDepreciation)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impairment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impairment Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impairmentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${test.impairmentLoss > 0 ? "bg-orange-500" : "bg-green-500"}`}
                      >
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {test.testMethod === "value_in_use"
                            ? "Value in Use"
                            : "Fair Value Less Costs"}{" "}
                          Test
                        </p>
                        <p className="text-sm text-gray-600">
                          Asset ID: {test.assetId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Carrying Amount</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(test.carryingAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Recoverable Amount
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(test.recoverableAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Impairment Loss</p>
                        <p
                          className={`font-medium ${test.impairmentLoss > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {formatCurrency(test.impairmentLoss)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Asset Categories
                </h3>
                <p className="text-gray-600 mb-4">
                  Manage asset categories and default depreciation settings
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Category
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
