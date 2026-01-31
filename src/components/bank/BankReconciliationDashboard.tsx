"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Plus,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  Settings,
} from "lucide-react";
import {
  BankAccount,
  ReconciliationMatch,
  BankAccountType,
  MatchType,
} from "@/types/quickbooks-features";

interface BankReconciliationDashboardProps {
  businessId: string;
}

export function BankReconciliationDashboard({
  businessId,
}: BankReconciliationDashboardProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockAccounts: BankAccount[] = [
    {
      id: "1",
      businessId,
      accountName: "Business Checking Account",
      accountNumber: "****1234",
      bankName: "Chase Bank",
      accountType: BankAccountType.CHECKING,
      currency: "USD",
      isActive: true,
      lastReconciliationDate: new Date("2024-03-15"),
      createdAt: new Date(),
    },
    {
      id: "2",
      businessId,
      accountName: "Business Savings Account",
      accountNumber: "****5678",
      bankName: "Bank of America",
      accountType: BankAccountType.SAVINGS,
      currency: "USD",
      isActive: true,
      lastReconciliationDate: new Date("2024-03-10"),
      createdAt: new Date(),
    },
    {
      id: "3",
      businessId,
      accountName: "Business Credit Card",
      accountNumber: "****9012",
      bankName: "American Express",
      accountType: BankAccountType.BUSINESS,
      currency: "USD",
      isActive: true,
      lastReconciliationDate: new Date("2024-03-12"),
      createdAt: new Date(),
    },
  ];

  const mockMatches: ReconciliationMatch[] = [
    {
      id: "1",
      statementId: "stmt_001",
      statementLineId: "line_001",
      transactionId: "txn_001",
      matchType: MatchType.AUTO,
      confidenceScore: 0.95,
      matchedBy: "system",
      matchedAt: new Date(),
      notes: "Automatically matched by amount and date",
    },
    {
      id: "2",
      statementId: "stmt_001",
      statementLineId: "line_002",
      transactionId: "txn_002",
      matchType: MatchType.RULE_BASED,
      confidenceScore: 0.85,
      matchedBy: "system",
      matchedAt: new Date(),
      notes: "Matched using custom reconciliation rules",
    },
    {
      id: "3",
      statementId: "stmt_001",
      statementLineId: "line_003",
      transactionId: "txn_003",
      matchType: MatchType.MANUAL,
      confidenceScore: 1.0,
      matchedBy: "john.doe",
      matchedAt: new Date(),
      notes: "Manually matched by user",
    },
  ];

  useEffect(() => {
    // Load mock data
    setAccounts(mockAccounts);
    setMatches(mockMatches);
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

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case "auto":
        return "bg-green-500";
      case "rule_based":
        return "bg-blue-500";
      case "manual":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green-600";
    if (score >= 0.7) return "text-yellow-600";
    return "text-red-600";
  };

  // Calculate summary metrics
  const totalAccounts = accounts.length;
  const recentlyReconciled = accounts.filter((acc) => {
    if (!acc.lastReconciliationDate) return false;
    const daysSinceReconciliation = Math.floor(
      (new Date().getTime() - acc.lastReconciliationDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysSinceReconciliation <= 7;
  }).length;
  const needsReconciliation = totalAccounts - recentlyReconciled;

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bank Reconciliation
          </h2>
          <p className="text-gray-600">
            Reconcile bank accounts with intelligent matching
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Rules
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Accounts</p>
                <p className="text-2xl font-bold">{totalAccounts}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Recently Reconciled</p>
                <p className="text-2xl font-bold">{recentlyReconciled}</p>
              </div>
              <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Needs Reconciliation</p>
                <p className="text-2xl font-bold">{needsReconciliation}</p>
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
                <p className="text-purple-100 text-sm">Auto-Matched</p>
                <p className="text-2xl font-bold">
                  {matches.filter((m) => m.matchType === "auto").length}
                </p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="matches">Match History</TabsTrigger>
          <TabsTrigger value="rules">Matching Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Search and Filter */}
          <Card>
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
              <CardTitle>Bank Accounts ({filteredAccounts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Account Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Bank
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Last Reconciliation
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
                    {filteredAccounts.map((account) => {
                      const daysSinceReconciliation =
                        account.lastReconciliationDate
                          ? Math.floor(
                              (new Date().getTime() -
                                account.lastReconciliationDate.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )
                          : null;

                      const status =
                        daysSinceReconciliation === null
                          ? { label: "Never", color: "destructive" }
                          : daysSinceReconciliation <= 7
                            ? { label: "Current", color: "default" }
                            : daysSinceReconciliation <= 30
                              ? { label: "Overdue", color: "destructive" }
                              : { label: "Critical", color: "destructive" };

                      return (
                        <tr
                          key={account.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {account.accountName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {account.accountNumber}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">{account.bankName}</p>
                            <p className="text-sm text-gray-600">
                              {account.currency}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {account.accountType
                                .replace("_", " ")
                                .toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {account.lastReconciliationDate ? (
                              <div>
                                <p className="text-gray-900">
                                  {formatDate(account.lastReconciliationDate)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {daysSinceReconciliation} days ago
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500">Never</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={status.color as any}>
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Import
                              </Button>
                              <Button variant="outline" size="sm">
                                Reconcile
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

        <TabsContent value="reconciliation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Bank Reconciliation
                </h3>
                <p className="text-gray-600 mb-4">
                  Import bank statements and reconcile with transactions
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Statement
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Auto-Match
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Match History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-lg ${getMatchTypeColor(match.matchType)}`}
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {match.matchType.replace("_", " ").toUpperCase()}{" "}
                          Match
                        </p>
                        <p className="text-sm text-gray-600">
                          Statement: {match.statementId} → Transaction:{" "}
                          {match.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Confidence</p>
                        <p
                          className={`font-medium ${getConfidenceColor(match.confidenceScore)}`}
                        >
                          {(match.confidenceScore * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Matched By</p>
                        <p className="font-medium">{match.matchedBy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">
                          {formatDate(match.matchedAt)}
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

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matching Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Reconciliation Rules
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure automatic matching rules for better reconciliation
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
