"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  PieChart,
} from "lucide-react";

interface ProfitLossItem {
  accountCode: string;
  accountName: string;
  category:
    | "revenue"
    | "cost_of_goods_sold"
    | "operating_expenses"
    | "other_income"
    | "other_expenses";
  currentAmount: number;
  previousAmount?: number;
  variance?: number;
  variancePercent?: number;
}

interface ProfitLossSummary {
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  grossProfit: number;
  totalOperatingExpenses: number;
  operatingIncome: number;
  totalOtherIncome: number;
  totalOtherExpenses: number;
  netIncome: number;
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  period: string;
  previousPeriod?: string;
}

export default function ProfitLossPage() {
  const [profitLoss, setProfitLoss] = useState<ProfitLossItem[]>([]);
  const [summary, setSummary] = useState<ProfitLossSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  // Mock data for demonstration
  const mockProfitLoss: ProfitLossItem[] = [
    // Revenue
    {
      accountCode: "4000",
      accountName: "Sales Revenue",
      category: "revenue",
      currentAmount: 75000,
      previousAmount: 65000,
    },
    {
      accountCode: "4100",
      accountName: "Service Revenue",
      category: "revenue",
      currentAmount: 25000,
      previousAmount: 22000,
    },
    {
      accountCode: "4200",
      accountName: "Interest Income",
      category: "other_income",
      currentAmount: 500,
      previousAmount: 300,
    },

    // Cost of Goods Sold
    {
      accountCode: "5000",
      accountName: "Cost of Goods Sold",
      category: "cost_of_goods_sold",
      currentAmount: 30000,
      previousAmount: 26000,
    },

    // Operating Expenses
    {
      accountCode: "5100",
      accountName: "Salaries and Wages",
      category: "operating_expenses",
      currentAmount: 20000,
      previousAmount: 18000,
    },
    {
      accountCode: "5200",
      accountName: "Office Rent",
      category: "operating_expenses",
      currentAmount: 12000,
      previousAmount: 12000,
    },
    {
      accountCode: "5300",
      accountName: "Marketing Expenses",
      category: "operating_expenses",
      currentAmount: 5000,
      previousAmount: 4000,
    },
    {
      accountCode: "5400",
      accountName: "Utilities",
      category: "operating_expenses",
      currentAmount: 3000,
      previousAmount: 2500,
    },
    {
      accountCode: "5500",
      accountName: "Depreciation",
      category: "operating_expenses",
      currentAmount: 2000,
      previousAmount: 2000,
    },

    // Other Expenses
    {
      accountCode: "5600",
      accountName: "Interest Expense",
      category: "other_expenses",
      currentAmount: 800,
      previousAmount: 1000,
    },
  ];

  useEffect(() => {
    loadProfitLoss();
  }, [selectedPeriod]);

  const loadProfitLoss = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Calculate variances
      const dataWithVariances = mockProfitLoss.map((item) => ({
        ...item,
        variance: item.previousAmount
          ? item.currentAmount - item.previousAmount
          : 0,
        variancePercent: item.previousAmount
          ? ((item.currentAmount - item.previousAmount) / item.previousAmount) *
            100
          : 0,
      }));

      setProfitLoss(dataWithVariances);

      // Calculate summary
      const totalRevenue = dataWithVariances
        .filter((item) => item.category === "revenue")
        .reduce((sum, item) => sum + item.currentAmount, 0);

      const totalCostOfGoodsSold = dataWithVariances
        .filter((item) => item.category === "cost_of_goods_sold")
        .reduce((sum, item) => sum + item.currentAmount, 0);

      const grossProfit = totalRevenue - totalCostOfGoodsSold;

      const totalOperatingExpenses = dataWithVariances
        .filter((item) => item.category === "operating_expenses")
        .reduce((sum, item) => sum + item.currentAmount, 0);

      const operatingIncome = grossProfit - totalOperatingExpenses;

      const totalOtherIncome = dataWithVariances
        .filter((item) => item.category === "other_income")
        .reduce((sum, item) => sum + item.currentAmount, 0);

      const totalOtherExpenses = dataWithVariances
        .filter((item) => item.category === "other_expenses")
        .reduce((sum, item) => sum + item.currentAmount, 0);

      const netIncome = operatingIncome + totalOtherIncome - totalOtherExpenses;

      setSummary({
        totalRevenue,
        totalCostOfGoodsSold,
        grossProfit,
        totalOperatingExpenses,
        operatingIncome,
        totalOtherIncome,
        totalOtherExpenses,
        netIncome,
        grossProfitMargin:
          totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        operatingMargin:
          totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0,
        netProfitMargin:
          totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
        period: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error loading profit & loss:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const downloadProfitLoss = () => {
    // Create CSV content
    let csv =
      "Account Code,Account Name,Category,Current Amount,Previous Amount,Variance,Variance %\n";

    profitLoss.forEach((item) => {
      csv += `${item.accountCode},"${item.accountName}",${item.category},${item.currentAmount},${item.previousAmount || 0},${item.variance || 0},${item.variancePercent?.toFixed(2) || 0}\n`;
    });

    csv += `\nSummary,,Current Period\n`;
    csv += `,,Total Revenue,${summary?.totalRevenue}\n`;
    csv += `,,Cost of Goods Sold,${summary?.totalCostOfGoodsSold}\n`;
    csv += `,,Gross Profit,${summary?.grossProfit}\n`;
    csv += `,,Operating Expenses,${summary?.totalOperatingExpenses}\n`;
    csv += `,,Operating Income,${summary?.operatingIncome}\n`;
    csv += `,,Net Income,${summary?.netIncome}\n`;

    // Download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-loss-${summary?.period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const groupedByCategory = profitLoss.reduce(
    (groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    },
    {} as Record<string, ProfitLossItem[]>,
  );

  const getCategoryTotal = (category: string) => {
    return (
      groupedByCategory[category]?.reduce(
        (sum, item) => sum + item.currentAmount,
        0,
      ) || 0
    );
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                  Profit & Loss Statement
                </h1>
              </div>
              <p className="text-gray-600">
                Revenue, expenses, and profitability analysis
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="current-quarter">Current Quarter</option>
                <option value="current-year">Current Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <Button
                variant="outline"
                onClick={loadProfitLoss}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="outline" onClick={downloadProfitLoss}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Gross Profit</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.grossProfit)}
                    </p>
                    <p className="text-blue-100 text-sm">
                      {formatPercent(summary.grossProfitMargin)} margin
                    </p>
                  </div>
                  <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Operating Income</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.operatingIncome)}
                    </p>
                    <p className="text-purple-100 text-sm">
                      {formatPercent(summary.operatingMargin)} margin
                    </p>
                  </div>
                  <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-r ${summary.netIncome >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"} text-white`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Net Income</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.netIncome)}
                    </p>
                    <p className="text-white text-sm">
                      {formatPercent(summary.netProfitMargin)} margin
                    </p>
                  </div>
                  <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profit & Loss Statement */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>
                  For the period ending{" "}
                  {summary && new Date(summary.period).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Account Code
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Account Name
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Current Amount
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Previous Amount
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Variance
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">
                      Variance %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Revenue */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="py-2 px-4 font-semibold text-gray-900 uppercase text-sm"
                    >
                      Revenue
                    </td>
                  </tr>
                  {groupedByCategory.revenue?.map((item) => (
                    <tr
                      key={item.accountCode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountCode}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(item.currentAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.previousAmount || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance || 0)}`}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {getVarianceIcon(item.variance || 0)}
                          <span>{formatCurrency(item.variance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variancePercent || 0)}`}
                      >
                        {formatPercent(item.variancePercent || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-gray-300">
                    <td
                      colSpan={2}
                      className="py-2 px-4 font-semibold text-gray-900"
                    >
                      Total Revenue
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-gray-900">
                      {summary && formatCurrency(summary.totalRevenue)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                  </tr>

                  {/* Cost of Goods Sold */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="py-2 px-4 font-semibold text-gray-900 uppercase text-sm"
                    >
                      Cost of Goods Sold
                    </td>
                  </tr>
                  {groupedByCategory.cost_of_goods_sold?.map((item) => (
                    <tr
                      key={item.accountCode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountCode}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(item.currentAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.previousAmount || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance || 0)}`}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {getVarianceIcon(item.variance || 0)}
                          <span>{formatCurrency(item.variance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variancePercent || 0)}`}
                      >
                        {formatPercent(item.variancePercent || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-gray-300">
                    <td
                      colSpan={2}
                      className="py-2 px-4 font-semibold text-gray-900"
                    >
                      Total Cost of Goods Sold
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-gray-900">
                      {summary && formatCurrency(summary.totalCostOfGoodsSold)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-blue-50 font-semibold">
                    <td colSpan={2} className="py-3 px-4 text-blue-900">
                      Gross Profit
                    </td>
                    <td className="py-3 px-4 text-right text-blue-900">
                      {summary && formatCurrency(summary.grossProfit)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-900">
                      {summary && formatPercent(summary.grossProfitMargin)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-900">-</td>
                    <td className="py-3 px-4 text-right text-blue-900">-</td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="py-2 px-4 font-semibold text-gray-900 uppercase text-sm"
                    >
                      Operating Expenses
                    </td>
                  </tr>
                  {groupedByCategory.operating_expenses?.map((item) => (
                    <tr
                      key={item.accountCode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountCode}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(item.currentAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.previousAmount || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance || 0)}`}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {getVarianceIcon(item.variance || 0)}
                          <span>{formatCurrency(item.variance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variancePercent || 0)}`}
                      >
                        {formatPercent(item.variancePercent || 0)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b-2 border-gray-300">
                    <td
                      colSpan={2}
                      className="py-2 px-4 font-semibold text-gray-900"
                    >
                      Total Operating Expenses
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-gray-900">
                      {summary &&
                        formatCurrency(summary.totalOperatingExpenses)}
                    </td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                    <td className="py-2 px-4 text-right text-gray-600">-</td>
                  </tr>

                  {/* Operating Income */}
                  <tr className="bg-purple-50 font-semibold">
                    <td colSpan={2} className="py-3 px-4 text-purple-900">
                      Operating Income
                    </td>
                    <td className="py-3 px-4 text-right text-purple-900">
                      {summary && formatCurrency(summary.operatingIncome)}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-900">
                      {summary && formatPercent(summary.operatingMargin)}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-900">-</td>
                    <td className="py-3 px-4 text-right text-purple-900">-</td>
                  </tr>

                  {/* Other Income and Expenses */}
                  <tr className="bg-gray-50">
                    <td
                      colSpan={6}
                      className="py-2 px-4 font-semibold text-gray-900 uppercase text-sm"
                    >
                      Other Income and Expenses
                    </td>
                  </tr>
                  {groupedByCategory.other_income?.map((item) => (
                    <tr
                      key={item.accountCode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountCode}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(item.currentAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.previousAmount || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance || 0)}`}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {getVarianceIcon(item.variance || 0)}
                          <span>{formatCurrency(item.variance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variancePercent || 0)}`}
                      >
                        {formatPercent(item.variancePercent || 0)}
                      </td>
                    </tr>
                  ))}
                  {groupedByCategory.other_expenses?.map((item) => (
                    <tr
                      key={item.accountCode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountCode}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {item.accountName}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {formatCurrency(item.currentAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.previousAmount || 0)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variance || 0)}`}
                      >
                        <div className="flex items-center justify-end space-x-1">
                          {getVarianceIcon(item.variance || 0)}
                          <span>{formatCurrency(item.variance || 0)}</span>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${getVarianceColor(item.variancePercent || 0)}`}
                      >
                        {formatPercent(item.variancePercent || 0)}
                      </td>
                    </tr>
                  ))}

                  {/* Net Income */}
                  <tr className="bg-gray-100 font-bold text-lg">
                    <td colSpan={2} className="py-4 px-4 text-gray-900">
                      Net Income
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      {summary && formatCurrency(summary.netIncome)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">
                      {summary && formatPercent(summary.netProfitMargin)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900">-</td>
                    <td className="py-4 px-4 text-right text-gray-900">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
