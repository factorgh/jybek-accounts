"use client";

import * as React from "react";
import { useState } from "react";
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
  Scale,
  Calculator,
} from "lucide-react";
import { useTrialBalance } from "@/lib/hooks/useTrialBalance";

export default function TrialBalancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const {
    trialBalance,
    summary,
    isLoading,
    error,
    downloadTrialBalance,
    refresh,
  } = useTrialBalance(selectedPeriod);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const groupedByType = trialBalance.reduce(
    (groups, item) => {
      if (!groups[item.accountType]) {
        groups[item.accountType] = [];
      }
      groups[item.accountType].push(item);
      return groups;
    },
    {} as Record<string, any[]>,
  );

  const getTypeTotal = (
    type: string,
    field: "debitBalance" | "creditBalance",
  ) => {
    return (
      groupedByType[type]?.reduce((sum, item) => sum + item[field], 0) || 0
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
            <Button onClick={refresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                  Trial Balance
                </h1>
              </div>
              <p className="text-gray-600">
                Verify that total debits equal total credits for all accounts
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
              <Button variant="outline" onClick={refresh} disabled={isLoading}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={downloadTrialBalance}
                disabled={!summary}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Debits</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.totalDebits)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Credits</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.totalCredits)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`bg-gradient-to-r ${summary.isBalanced ? "from-green-500 to-green-600" : "from-red-500 to-red-600"} text-white`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Balance Status</p>
                    <p className="text-2xl font-bold">
                      {summary.isBalanced ? "Balanced" : "Not Balanced"}
                    </p>
                  </div>
                  <div className="p-3 bg-white bg-opacity-30 rounded-lg">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Difference</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(summary.difference)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trial Balance Report</CardTitle>
                <CardDescription>
                  As of {summary && formatDate(summary.asOfDate)}
                </CardDescription>
              </div>
              <Badge variant={summary?.isBalanced ? "default" : "destructive"}>
                {summary?.isBalanced ? "Balanced ✓" : "Not Balanced ✗"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading trial balance...</p>
              </div>
            ) : (
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
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        Debit Balance
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">
                        Credit Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedByType).map(([type, items]) => (
                      <React.Fragment key={type}>
                        <tr className="bg-gray-50">
                          <td
                            colSpan={5}
                            className="py-2 px-4 font-semibold text-gray-900 uppercase text-sm"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </td>
                        </tr>
                        {items.map((item) => (
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
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="capitalize">
                                {item.accountType}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {item.debitBalance > 0
                                ? formatCurrency(item.debitBalance)
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {item.creditBalance > 0
                                ? formatCurrency(item.creditBalance)
                                : "-"}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-b-2 border-gray-300">
                          <td
                            colSpan={3}
                            className="py-2 px-4 font-semibold text-gray-900"
                          >
                            Total {type.charAt(0).toUpperCase() + type.slice(1)}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-gray-900">
                            {formatCurrency(getTypeTotal(type, "debitBalance"))}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-gray-900">
                            {formatCurrency(
                              getTypeTotal(type, "creditBalance"),
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}

                    {/* Grand Total */}
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={3} className="py-3 px-4 text-gray-900">
                        Grand Total
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {summary && formatCurrency(summary.totalDebits)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        {summary && formatCurrency(summary.totalCredits)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
