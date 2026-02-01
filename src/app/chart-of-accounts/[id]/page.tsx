"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Edit,
  Trash2,
  DollarSign,
  Building,
  CreditCard,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
} from "lucide-react";

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "income" | "expense";
  balance: number;
  isActive: boolean;
  description?: string;
  parentCode?: string;
  businessId: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccount();
  }, [params.id]);

  const fetchAccount = async () => {
    try {
      const response = await fetch(`/api/chart-of-accounts/${params.id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAccount(data.data);
      } else {
        setError("Failed to fetch account");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(`/api/chart-of-accounts/${params.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
          alert("Account deleted successfully!");
          router.push("/chart-of-accounts");
        } else {
          setError("Failed to delete account");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    }
  };

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "asset":
        return <Building className="h-5 w-5" />;
      case "liability":
        return <CreditCard className="h-5 w-5" />;
      case "equity":
        return <PiggyBank className="h-5 w-5" />;
      case "income":
        return <TrendingUp className="h-5 w-5" />;
      case "expense":
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
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
    if (type === "asset" || type === "expense") {
      return balance >= 0 ? "text-green-600" : "text-red-600";
    } else {
      return balance >= 0 ? "text-green-600" : "text-red-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading account...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
            <Link href="/chart-of-accounts">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chart of Accounts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">
              Account Not Found
            </h1>
            <Link href="/chart-of-accounts">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chart of Accounts
              </Button>
            </Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <Link href="/chart-of-accounts">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {account.name}
                </h1>
                <Badge variant="outline" className="shrink-0">
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getTypeColor(account.type)}`}
                    />
                    <span className="text-xs sm:text-sm">
                      {getTypeLabel(account.type)}
                    </span>
                  </div>
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/chart-of-accounts/${account.id}/edit`}>
                <Button size="sm" className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(account.type)}
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Account Code</p>
                    <p className="font-medium text-lg">{account.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Name</p>
                    <p className="font-medium text-lg">{account.name}</p>
                  </div>
                  {account.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium">{account.description}</p>
                    </div>
                  )}
                  {account.parentCode && (
                    <div>
                      <p className="text-sm text-gray-600">Parent Account</p>
                      <p className="font-medium">{account.parentCode}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p
                      className={`text-2xl font-bold ${getBalanceColor(account.type, account.balance)}`}
                    >
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Type Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Type Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge variant="outline">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(account.type)}
                        <span>{getTypeLabel(account.type)}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Normal Balance
                    </span>
                    <span className="text-sm font-medium">
                      {account.type === "asset" || account.type === "expense"
                        ? "Debit"
                        : "Credit"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Financial Statement
                    </span>
                    <span className="text-sm font-medium">
                      {account.type === "asset" ||
                      account.type === "liability" ||
                      account.type === "equity"
                        ? "Balance Sheet"
                        : "Income Statement"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href={`/transactions/create?accountId=${account.id}`}>
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Transaction
                    </Button>
                  </Link>
                  <Link href={`/chart-of-accounts/${account.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Account
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Print/Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {formatDate(account.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Age</span>
                    <span className="text-sm font-medium">
                      {Math.floor(
                        (Date.now() - new Date(account.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
