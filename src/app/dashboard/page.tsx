"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl">
                Welcome back! Here's a comprehensive overview of your business
                performance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-10">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Total Revenue
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  $45,231.89
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    +20.1% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <ArrowDownRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Total Expenses
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  $12,456.78
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    -5.3% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Net Profit
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  $32,775.11
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    +15.2% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Cash Balance
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  $89,234.56
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Available funds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Quick Actions
            </h2>
            <span className="text-sm text-gray-500">Get started quickly</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <Link href="/transactions/create">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    New Transaction
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Record income or expense
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <Link href="/invoices/create">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Create Invoice
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Generate new invoice
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <Link href="/customers">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Customers
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Manage customers
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <Link href="/chart-of-accounts">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Chart of Accounts
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Manage account structure
                  </p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <Link href="/reports">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                    Financial Reports
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    P&L, Balance Sheet, Cash Flow
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Transactions
                <Link href="/transactions">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>Latest accounting transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Office Rent Payment
                    </p>
                    <p className="text-sm text-gray-600">Dec 15, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-$2,500.00</p>
                    <p className="text-xs text-gray-500">Expense</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Client Payment - ABC Corp
                    </p>
                    <p className="text-sm text-gray-600">Dec 14, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+$5,000.00</p>
                    <p className="text-xs text-gray-500">Income</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Software Subscription
                    </p>
                    <p className="text-sm text-gray-600">Dec 13, 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">-$99.00</p>
                    <p className="text-xs text-gray-500">Expense</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Revenue chart will be displayed here</p>
                  <p className="text-sm">
                    Integration with chart library needed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
