"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Download,
  FileText,
  Settings,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  TaxJurisdiction,
  TaxReturn,
  TaxRate,
  FilingFrequency,
  TaxReturnStatus,
  TaxType,
  TaxLiability,
} from "@/types/quickbooks-features";

interface TaxManagementDashboardProps {
  businessId: string;
}

export function TaxManagementDashboard({
  businessId,
}: TaxManagementDashboardProps) {
  const [jurisdictions, setJurisdictions] = useState<TaxJurisdiction[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [liabilities, setLiabilities] = useState<TaxLiability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockJurisdictions: TaxJurisdiction[] = [
    {
      id: "1",
      jurisdictionCode: "US",
      jurisdictionName: "United States - Federal",
      taxAuthority: "IRS",
      filingFrequency: FilingFrequency.QUARTERLY,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "2",
      jurisdictionCode: "CA",
      jurisdictionName: "California State",
      taxAuthority: "California Franchise Tax Board",
      filingFrequency: FilingFrequency.QUARTERLY,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "3",
      jurisdictionCode: "NY",
      jurisdictionName: "New York State",
      taxAuthority: "New York State Department of Taxation",
      filingFrequency: FilingFrequency.QUARTERLY,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  const mockTaxReturns: TaxReturn[] = [
    {
      id: "1",
      businessId,
      jurisdictionId: "1",
      returnPeriod: "2024-Q1",
      periodStartDate: new Date("2024-01-01"),
      periodEndDate: new Date("2024-03-31"),
      totalTaxableAmount: 125000,
      totalTaxAmount: 8750,
      status: TaxReturnStatus.FILED,
      dueDate: new Date("2024-04-20"),
      filedDate: new Date("2024-04-15"),
      paidDate: new Date("2024-04-18"),
      createdAt: new Date(),
    },
    {
      id: "2",
      businessId,
      jurisdictionId: "2",
      returnPeriod: "2024-Q1",
      periodStartDate: new Date("2024-01-01"),
      periodEndDate: new Date("2024-03-31"),
      totalTaxableAmount: 45000,
      totalTaxAmount: 3150,
      status: TaxReturnStatus.READY_TO_FILE,
      dueDate: new Date("2024-04-30"),
      createdAt: new Date(),
    },
    {
      id: "3",
      businessId,
      jurisdictionId: "3",
      returnPeriod: "2024-Q1",
      periodStartDate: new Date("2024-01-01"),
      periodEndDate: new Date("2024-03-31"),
      totalTaxableAmount: 78000,
      totalTaxAmount: 5460,
      status: TaxReturnStatus.DRAFT,
      dueDate: new Date("2024-04-25"),
      createdAt: new Date(),
    },
  ];

  const mockTaxRates: TaxRate[] = [
    {
      id: "1",
      jurisdictionId: "1",
      taxType: TaxType.SALES,
      ratePercentage: 8.5,
      effectiveDate: new Date("2024-01-01"),
      description: "Federal sales tax rate",
      isActive: true,
    },
    {
      id: "2",
      jurisdictionId: "2",
      taxType: TaxType.SALES,
      ratePercentage: 7.25,
      effectiveDate: new Date("2024-01-01"),
      description: "California state sales tax rate",
      isActive: true,
    },
  ];

  const mockLiabilities: TaxLiability[] = [
    {
      id: "1",
      businessId,
      taxType: TaxType.SALES,
      jurisdictionId: "2",
      liabilityAmount: 9375,
      dueDate: new Date("2024-04-20"),
      isPaid: false,
      createdAt: new Date(),
    },
    {
      id: "2",
      businessId,
      taxType: TaxType.SALES,
      jurisdictionId: "3",
      liabilityAmount: 6250,
      dueDate: new Date("2024-04-20"),
      isPaid: false,
      createdAt: new Date(),
    },
  ];

  useEffect(() => {
    // Load mock data
    setJurisdictions(mockJurisdictions);
    setTaxReturns(mockTaxReturns);
    setLiabilities(mockLiabilities);
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
      case "filed":
        return "bg-green-500";
      case "paid":
        return "bg-blue-500";
      case "ready_to_file":
        return "bg-orange-500";
      case "draft":
        return "bg-gray-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "filed":
        return "Filed";
      case "paid":
        return "Paid";
      case "ready_to_file":
        return "Ready to File";
      case "draft":
        return "Draft";
      case "overdue":
        return "Overdue";
      default:
        return status;
    }
  };

  // Calculate summary metrics
  const totalLiabilities = liabilities.reduce(
    (sum, liability) => sum + liability.liabilityAmount,
    0,
  );
  const overdueLiabilities = liabilities
    .filter((liability) => new Date() > liability.dueDate && !liability.isPaid)
    .reduce((sum, liability) => sum + liability.liabilityAmount, 0);
  const pendingReturns = taxReturns.filter(
    (ret) => ret.status === "draft" || ret.status === "ready_to_file",
  ).length;
  const upcomingDue = liabilities.filter(
    (liability) => new Date() <= liability.dueDate && !liability.isPaid,
  ).length;

  const filteredReturns = taxReturns.filter(
    (returnItem) =>
      returnItem.returnPeriod
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      returnItem.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tax Management</h2>
          <p className="text-gray-600">
            Manage tax compliance and filings across jurisdictions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Liabilities</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Overdue Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(overdueLiabilities)}
                </p>
              </div>
              <div className="p-3 bg-red-400 bg-opacity-30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Returns</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
              <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Upcoming Due</p>
                <p className="text-2xl font-bold">{upcomingDue}</p>
              </div>
              <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="returns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="returns">Tax Returns</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
          <TabsTrigger value="jurisdictions">Jurisdictions</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="returns" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search returns..."
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

          {/* Returns Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Returns ({filteredReturns.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Period
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Jurisdiction
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Taxable Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Tax Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Due Date
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
                    {filteredReturns.map((returnItem) => {
                      const jurisdiction = jurisdictions.find(
                        (j) => j.id === returnItem.jurisdictionId,
                      );
                      const isOverdue =
                        new Date() > returnItem.dueDate &&
                        returnItem.status !== "paid";

                      return (
                        <tr
                          key={returnItem.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {returnItem.returnPeriod}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(returnItem.periodStartDate)} -{" "}
                              {formatDate(returnItem.periodEndDate)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              {jurisdiction?.jurisdictionName || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {jurisdiction?.taxAuthority}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-900">
                              {formatCurrency(returnItem.totalTaxableAmount)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(returnItem.totalTaxAmount)}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-gray-900">
                                {formatDate(returnItem.dueDate)}
                              </p>
                              {isOverdue && (
                                <p className="text-sm text-red-600">Overdue</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                returnItem.status === "overdue"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              <div className={`flex items-center space-x-1`}>
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(returnItem.status)}`}
                                />
                                <span>{getStatusLabel(returnItem.status)}</span>
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              {returnItem.status === "draft" && (
                                <Button size="sm">File</Button>
                              )}
                              {returnItem.status === "ready_to_file" && (
                                <Button size="sm">Submit</Button>
                              )}
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

        <TabsContent value="liabilities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liabilities.map((liability) => {
                  const jurisdiction = jurisdictions.find(
                    (j) => j.id === liability.jurisdictionId,
                  );
                  const isOverdue =
                    new Date() > liability.dueDate && !liability.isPaid;
                  const daysUntilDue = Math.ceil(
                    (liability.dueDate.getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={liability.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-lg ${isOverdue ? "bg-red-500" : daysUntilDue <= 7 ? "bg-orange-500" : "bg-green-500"}`}
                        >
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {liability.taxType.toUpperCase()} Tax
                          </p>
                          <p className="text-sm text-gray-600">
                            {jurisdiction?.jurisdictionName || "Unknown"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(liability.liabilityAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p
                            className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}
                          >
                            {formatDate(liability.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge
                            variant={
                              liability.isPaid
                                ? "default"
                                : isOverdue
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {liability.isPaid
                              ? "Paid"
                              : isOverdue
                                ? "Overdue"
                                : `Due in ${daysUntilDue} days`}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!liability.isPaid && (
                            <Button size="sm">Pay Now</Button>
                          )}
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jurisdictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Jurisdictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jurisdictions.map((jurisdiction) => (
                  <Card key={jurisdiction.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {jurisdiction.jurisdictionName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {jurisdiction.taxAuthority}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {jurisdiction.jurisdictionCode}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Filing Frequency:
                          </span>
                          <span className="font-medium">
                            {jurisdiction.filingFrequency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge
                            variant={
                              jurisdiction.isActive ? "default" : "secondary"
                            }
                          >
                            {jurisdiction.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tax Payment History
                </h3>
                <p className="text-gray-600 mb-4">
                  View and manage tax payment history
                </p>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
