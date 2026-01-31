"use client";

import * as React from "react";
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
  FileText,
  TrendingUp,
  TrendingDown,
  Scale,
  DollarSign,
  Target,
  PieChart,
  Calendar,
  Download,
} from "lucide-react";

export default function FinancialStatementsPage() {
  const statements = [
    {
      title: "Trial Balance",
      description:
        "Verify that total debits equal total credits for all accounts",
      icon: Scale,
      href: "/financial-statements/trial-balance",
      color: "blue",
      status: "balanced",
      lastUpdated: "2024-01-28",
      frequency: "Monthly",
    },
    {
      title: "Profit & Loss Statement",
      description: "Revenue, expenses, and profitability analysis",
      icon: TrendingUp,
      href: "/financial-statements/profit-loss",
      color: "green",
      status: "positive",
      lastUpdated: "2024-01-28",
      frequency: "Monthly",
    },
    {
      title: "Balance Sheet",
      description: "Assets, liabilities, and equity snapshot",
      icon: Target,
      href: "#",
      color: "purple",
      status: "available",
      lastUpdated: "2024-01-28",
      frequency: "Monthly",
    },
    {
      title: "Cash Flow Statement",
      description: "Operating, investing, and financing activities",
      icon: DollarSign,
      href: "#",
      color: "orange",
      status: "available",
      lastUpdated: "2024-01-28",
      frequency: "Monthly",
    },
    {
      title: "Statement of Changes in Equity",
      description: "Equity movements and retained earnings",
      icon: PieChart,
      href: "#",
      color: "pink",
      status: "available",
      lastUpdated: "2024-01-28",
      frequency: "Monthly",
    },
    {
      title: "Custom Reports",
      description: "Create custom financial reports",
      icon: FileText,
      href: "/reports",
      color: "gray",
      status: "available",
      lastUpdated: "2024-01-28",
      frequency: "On-demand",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "balanced":
        return "bg-green-100 text-green-800";
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "balanced":
        return "Balanced ✓";
      case "positive":
        return "Positive Growth ✓";
      case "negative":
        return "Negative ⚠";
      default:
        return "Available";
    }
  };

  const getCardColor = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-blue-600";
      case "green":
        return "from-green-500 to-green-600";
      case "purple":
        return "from-purple-500 to-purple-600";
      case "orange":
        return "from-orange-500 to-orange-600";
      case "pink":
        return "from-pink-500 to-pink-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Financial Statements
              </h1>
              <p className="text-gray-600">
                Generate and analyze comprehensive financial reports
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Period: Current Month
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">$100,000</p>
                  <p className="text-blue-100 text-sm">
                    +15.3% from last month
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
                  <p className="text-green-100 text-sm">Net Income</p>
                  <p className="text-2xl font-bold">$23,700</p>
                  <p className="text-green-100 text-sm">23.7% profit margin</p>
                </div>
                <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Assets</p>
                  <p className="text-2xl font-bold">$102,000</p>
                  <p className="text-purple-100 text-sm">+5.2% growth</p>
                </div>
                <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Cash Balance</p>
                  <p className="text-2xl font-bold">$25,000</p>
                  <p className="text-orange-100 text-sm">24.5% of assets</p>
                </div>
                <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Statements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statements.map((statement, index) => {
            const Icon = statement.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${getCardColor(statement.color)} text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusColor(statement.status)}
                    >
                      {getStatusLabel(statement.status)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{statement.title}</CardTitle>
                  <CardDescription>{statement.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">
                        {formatDate(statement.lastUpdated)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-medium capitalize">
                        {statement.frequency}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      {statement.href !== "#" ? (
                        <Link href={statement.href}>
                          <Button className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>
                Additional tools for financial analysis and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span>Export Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Period Comparison</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Variance Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Custom Templates</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
