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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building,
  CreditCard,
  PiggyBank,
  Target,
  ShoppingCart,
  Wrench,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useChartOfAccounts } from "@/lib/hooks/useChartOfAccounts";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  balance: number;
  isActive: boolean;
  description?: string;
  parentCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChartOfAccountsPage() {
  const { accounts, isLoading, error, deleteAccount } = useChartOfAccounts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isSeeding, setIsSeeding] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Building className="h-4 w-4" />;
      case "liability":
        return <CreditCard className="h-4 w-4" />;
      case "equity":
        return <PiggyBank className="h-4 w-4" />;
      case "income":
        return <TrendingUp className="h-4 w-4" />;
      case "expense":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "asset":
        return "bg-blue-500";
      case "liability":
        return "bg-red-500";
      case "equity":
        return "bg-green-500";
      case "income":
        return "bg-purple-500";
      case "expense":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "asset":
        return "Asset";
      case "liability":
        return "Liability";
      case "equity":
        return "Equity";
      case "income":
        return "Income";
      case "expense":
        return "Expense";
      default:
        return type;
    }
  };

  const getBalanceColor = (type: string, balance: number) => {
    if (type === "expense") return "text-red-600";
    if (type === "income") return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-gray-900";
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  const accountsByType = {
    asset: accounts.filter((a) => a.type === "asset"),
    liability: accounts.filter((a) => a.type === "liability"),
    equity: accounts.filter((a) => a.type === "equity"),
    income: accounts.filter((a) => a.type === "income"),
    expense: accounts.filter((a) => a.type === "expense"),
  };

  const getTypeTotal = (type: string) => {
    return accounts
      .filter((a) => a.type === type)
      .reduce((sum, account) => sum + account.balance, 0);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This action cannot be undone.",
      )
    ) {
      const result = await deleteAccount(id);
      if (result.success) {
        alert("Account deleted successfully!");
      } else {
        alert(result.error || "Failed to delete account");
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (
      window.confirm(
        "This will clear all existing accounts and add default accounts. Are you sure?",
      )
    ) {
      try {
        setIsSeeding(true);
        const response = await fetch("/api/chart-of-accounts/seed", {
          method: "POST",
        });

        const result = await response.json();

        if (result.success) {
          alert(result.message || "Database seeded successfully!");
          // Refresh the accounts list
          window.location.reload();
        } else {
          alert(result.error || "Failed to seed database");
        }
      } catch (error) {
        alert("An error occurred while seeding the database");
      } finally {
        setIsSeeding(false);
      }
    }
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
                  Chart of Accounts
                </h1>
              </div>
              <p className="text-gray-600">
                Manage your accounting structure and track account balances
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
              >
                {isSeeding ? "Seeding..." : "Seed Database"}
              </Button>
              <Link href="/chart-of-accounts/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs">Assets</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTypeTotal("asset"))}
                  </p>
                  <p className="text-blue-100 text-xs">
                    {accountsByType.asset.length} accounts
                  </p>
                </div>
                <div className="p-2 bg-blue-400 bg-opacity-30 rounded-lg">
                  <Building className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-xs">Liabilities</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTypeTotal("liability"))}
                  </p>
                  <p className="text-red-100 text-xs">
                    {accountsByType.liability.length} accounts
                  </p>
                </div>
                <div className="p-2 bg-red-400 bg-opacity-30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs">Equity</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTypeTotal("equity"))}
                  </p>
                  <p className="text-green-100 text-xs">
                    {accountsByType.equity.length} accounts
                  </p>
                </div>
                <div className="p-2 bg-green-400 bg-opacity-30 rounded-lg">
                  <PiggyBank className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs">Income</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTypeTotal("income"))}
                  </p>
                  <p className="text-purple-100 text-xs">
                    {accountsByType.income.length} accounts
                  </p>
                </div>
                <div className="p-2 bg-purple-400 bg-opacity-30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs">Expenses</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(getTypeTotal("expense"))}
                  </p>
                  <p className="text-orange-100 text-xs">
                    {accountsByType.expense.length} accounts
                  </p>
                </div>
                <div className="p-2 bg-orange-400 bg-opacity-30 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="asset">Assets</option>
                <option value="liability">Liabilities</option>
                <option value="equity">Equity</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Accounts ({filteredAccounts.length})</CardTitle>
            <CardDescription>
              Complete chart of accounts with current balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Account Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Balance
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
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">
                          {account.code}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {account.name}
                          </p>
                          {account.description && (
                            <p className="text-sm text-gray-600">
                              {account.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          <div className={`flex items-center space-x-1`}>
                            <div
                              className={`w-2 h-2 rounded-full ${getTypeColor(account.type)}`}
                            />
                            <span>{getTypeLabel(account.type)}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p
                          className={`font-medium ${getBalanceColor(account.type, account.balance)}`}
                        >
                          {formatCurrency(account.balance)}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={account.isActive ? "default" : "secondary"}
                        >
                          {account.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Link href={`/chart-of-accounts/${account.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/chart-of-accounts/${account.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
