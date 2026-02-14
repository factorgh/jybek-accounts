"use client";

import { useState, useEffect } from "react";
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
  Filter,
  Calendar,
  RefreshCw,
  Zap,
  CreditCard,
  PieChart,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashBalance: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "income" | "expense" | "journal" | "receipt";
  transactionDate?: string;
  totalAmount?: number;
}

interface FilterOptions {
  dateRange: "all" | "today" | "week" | "month" | "year";
  transactionType: "all" | "income" | "expense" | "journal" | "receipt";
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashBalance: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "month",
    transactionType: "all",
  });
  const [tempFilters, setTempFilters] = useState<FilterOptions>({
    dateRange: "month",
    transactionType: "all",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allTransactions]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch transactions
      const transactionsResponse = await fetch("/api/transactions");
      const transactionsData = await transactionsResponse.json();

      if (transactionsData.success) {
        const txs = transactionsData.data || [];
        setAllTransactions(txs);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setIsFilterLoading(true);

      let filteredTransactions = [...allTransactions];

      // Filter by transaction type
      if (filters.transactionType !== "all") {
        filteredTransactions = filteredTransactions.filter(
          (t) => t.type === filters.transactionType,
        );
      }

      // Filter by date range
      const now = new Date();
      let startDate: Date | null = null;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case "all":
        default:
          startDate = null;
          break;
      }

      if (startDate) {
        filteredTransactions = filteredTransactions.filter((t) => {
          const transactionDate = new Date(t.transactionDate || t.date || "");
          return transactionDate >= startDate;
        });
      }

      // Sort by date (most recent first)
      filteredTransactions.sort((a, b) => {
        const dateA = new Date(a.transactionDate || a.date || "");
        const dateB = new Date(b.transactionDate || b.date || "");
        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(filteredTransactions.slice(0, 3));

      // Calculate stats from filtered transactions
      const income = filteredTransactions
        .filter((t: any) => t.type === "income" || t.type === "receipt")
        .reduce(
          (sum: number, t: any) => sum + (t.totalAmount || t.amount || 0),
          0,
        );
      const expenses = filteredTransactions
        .filter((t: any) => t.type === "expense")
        .reduce(
          (sum: number, t: any) => sum + (t.totalAmount || t.amount || 0),
          0,
        );

      setStats({
        totalRevenue: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        cashBalance: income - expenses,
      });
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleFilterChange = (
    filterType: keyof FilterOptions,
    value: FilterOptions[keyof FilterOptions],
  ) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const applyTempFilters = async () => {
    setIsFilterLoading(true);
    setFilters(tempFilters);
    // The useEffect will handle the actual filtering
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 500);
  };

  const resetFilters = async () => {
    setIsFilterLoading(true);
    const defaultFilters = {
      dateRange: "month",
      transactionType: "all",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsFilterLoading(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
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

        {/* Filters Section */}
        <div className="mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2 mb-3 lg:mb-0">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {isFilterLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Date Range Filter */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <select
                      value={tempFilters.dateRange}
                      onChange={(e) =>
                        handleFilterChange(
                          "dateRange",
                          e.target.value as FilterOptions["dateRange"],
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                      disabled={isFilterLoading}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  {/* Transaction Type Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <select
                      value={tempFilters.transactionType}
                      onChange={(e) =>
                        handleFilterChange(
                          "transactionType",
                          e.target.value as FilterOptions["transactionType"],
                        )
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                      disabled={isFilterLoading}
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expenses</option>
                      <option value="journal">Journal</option>
                      <option value="receipt">Receipts</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={applyTempFilters}
                      size="sm"
                      disabled={
                        isFilterLoading ||
                        JSON.stringify(tempFilters) === JSON.stringify(filters)
                      }
                      className="whitespace-nowrap bg-blue-600 hover:bg-blue-700"
                    >
                      {isFilterLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : null}
                      Apply
                    </Button>
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      size="sm"
                      disabled={isFilterLoading}
                      className="whitespace-nowrap"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={fetchDashboardData}
                      size="sm"
                      disabled={isLoading || isFilterLoading}
                      className="whitespace-nowrap"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isLoading || isFilterLoading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-10">
          {/* Total Revenue Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/30 rounded h-5 w-5 sm:h-6 sm:w-6"></div>
                  ) : (
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Total Revenue
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/20 rounded h-8 w-32"></div>
                  ) : (
                    formatCurrency(stats.totalRevenue)
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {isLoading || isFilterLoading
                      ? "Calculating..."
                      : "+20.1% from last month"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses Card */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/30 rounded h-5 w-5 sm:h-6 sm:w-6"></div>
                  ) : (
                    <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>
                <ArrowDownRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Total Expenses
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/20 rounded h-8 w-32"></div>
                  ) : (
                    formatCurrency(stats.totalExpenses)
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {isLoading || isFilterLoading
                      ? "Calculating..."
                      : "-5.3% from last month"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/30 rounded h-5 w-5 sm:h-6 sm:w-6"></div>
                  ) : (
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/80" />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm mb-1">
                  Net Profit
                </p>
                <div className="text-2xl sm:text-3xl font-bold mb-2">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/20 rounded h-8 w-32"></div>
                  ) : (
                    formatCurrency(stats.netProfit)
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {isLoading || isFilterLoading
                      ? "Calculating..."
                      : "+15.2% from last month"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Balance Card */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/30 rounded h-5 w-5 sm:h-6 sm:w-6"></div>
                  ) : (
                    <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
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
                  {isLoading || isFilterLoading ? (
                    <div className="animate-pulse bg-white/20 rounded h-8 w-32"></div>
                  ) : (
                    formatCurrency(stats.cashBalance)
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {isLoading || isFilterLoading
                      ? "Calculating..."
                      : "Available funds"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* New Transaction Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <Link href="/transactions/create" className="block">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-blue-600 transition-colors">
                    New Transaction
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Record income or expense
                  </p>
                  <div className="flex items-center justify-center text-blue-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Create Invoice Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <Link href="/invoices/create" className="block">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-green-600 transition-colors">
                    Create Invoice
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Generate new invoice
                  </p>
                  <div className="flex items-center justify-center text-green-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Customers Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <Link href="/customers" className="block">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-purple-600 transition-colors">
                    Customers
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Manage customers</p>
                  <div className="flex items-center justify-center text-purple-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Chart of Accounts Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <Link href="/chart-of-accounts" className="block">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-gray-600 transition-colors">
                    Chart of Accounts
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage account structure
                  </p>
                  <div className="flex items-center justify-center text-gray-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Financial Reports Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border border-gray-200">
              <Link href="/reports" className="block">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-indigo-600 transition-colors">
                    Financial Reports
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    P&L, Balance Sheet, Cash Flow
                  </p>
                  <div className="flex items-center justify-center text-indigo-600">
                    <ArrowRight className="h-4 w-4" />
                  </div>
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
              {isFilterLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-300 rounded w-16 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-300 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              transaction.transactionDate ||
                                transaction.date ||
                                "",
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.type === "income" ||
                              transaction.type === "receipt"
                                ? "text-green-600"
                                : transaction.type === "expense"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                          >
                            {transaction.type === "income" ||
                            transaction.type === "receipt"
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              Math.abs(
                                transaction.totalAmount ||
                                  transaction.amount ||
                                  0,
                              ),
                            )}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {transaction.type === "receipt"
                              ? "Income"
                              : transaction.type}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transactions found</p>
                      <p className="text-sm">
                        Try adjusting filters or create new transactions
                      </p>
                    </div>
                  )}
                </div>
              )}
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
