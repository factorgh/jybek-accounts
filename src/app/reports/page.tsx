"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowReportComponent } from "@/components/reports/CashFlowReport";
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import {
  CashFlowReport,
  AgedReceivablesReport,
} from "@/types/quickbooks-features";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("cash-flow");
  const [cashFlowData, setCashFlowData] = useState<CashFlowReport | null>(null);
  const [agedReceivablesData, setAgedReceivablesData] =
    useState<AgedReceivablesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockCashFlowData: CashFlowReport = {
    id: "1",
    businessId: "demo-business",
    reportPeriod: {
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-03-31"),
    },
    operatingActivities: [
      {
        description: "Customer Payment - ABC Corp",
        amount: 15000,
        category: "Cash receipts from customers",
        accountId: "acc-1",
        transactionId: "tx-1",
      },
      {
        description: "Supplier Payment - Office Supplies",
        amount: -3500,
        category: "Cash payments to suppliers",
        accountId: "acc-2",
        transactionId: "tx-2",
      },
      {
        description: "Customer Payment - XYZ Ltd",
        amount: 8500,
        category: "Cash receipts from customers",
        accountId: "acc-1",
        transactionId: "tx-3",
      },
    ],
    investingActivities: [
      {
        description: "Equipment Purchase",
        amount: -12000,
        category: "Purchase of equipment",
        accountId: "acc-3",
        transactionId: "tx-4",
      },
    ],
    financingActivities: [
      {
        description: "Loan Proceeds",
        amount: 25000,
        category: "Loan proceeds",
        accountId: "acc-4",
        transactionId: "tx-5",
      },
      {
        description: "Loan Repayment",
        amount: -5000,
        category: "Loan repayment",
        accountId: "acc-4",
        transactionId: "tx-6",
      },
    ],
    netIncreaseInCash: 28000,
    cashAtBeginningOfPeriod: 45000,
    cashAtEndOfPeriod: 73000,
    generatedAt: new Date(),
  };

  const mockAgedReceivablesData: AgedReceivablesReport = {
    id: "1",
    businessId: "demo-business",
    asOfDate: new Date("2024-03-31"),
    agingBuckets: [
      { daysRange: "Current", amount: 25000, count: 15, percentage: 45.5 },
      { daysRange: "1-30", amount: 12000, count: 8, percentage: 21.8 },
      { daysRange: "31-60", amount: 8000, count: 5, percentage: 14.5 },
      { daysRange: "61-90", amount: 6000, count: 3, percentage: 10.9 },
      { daysRange: "91+", amount: 4000, count: 2, percentage: 7.3 },
    ],
    totalOutstanding: 55000,
    currentAmount: 25000,
    overdueAmount: 30000,
  };

  useEffect(() => {
    // Load mock data
    setCashFlowData(mockCashFlowData);
    setAgedReceivablesData(mockAgedReceivablesData);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting report as ${format}`);
    // Implement export functionality
  };

  const ReportCard = ({
    title,
    description,
    icon: Icon,
    count,
    color,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    count?: string;
    color: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
            {count && (
              <p className="text-xs text-gray-500 mt-1">
                {count} reports available
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Reports
          </h1>
          <p className="text-gray-600">
            Generate and analyze comprehensive financial reports
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div className="p-3 bg-green-400 bg-opacity-30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Scheduled</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <div className="p-3 bg-purple-400 bg-opacity-30 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Last Generated</p>
                  <p className="text-2xl font-bold">2h</p>
                </div>
                <div className="p-3 bg-orange-400 bg-opacity-30 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ReportCard
            title="Cash Flow Statement"
            description="IAS 7 compliant cash flow analysis"
            icon={DollarSign}
            count="3 variants"
            color="bg-green-500"
          />
          <ReportCard
            title="Aged Receivables"
            description="Customer payment aging analysis"
            icon={Users}
            count="2 variants"
            color="bg-blue-500"
          />
          <ReportCard
            title="Budget Variance"
            description="Budget vs actual performance"
            icon={TrendingUp}
            count="5 variants"
            color="bg-purple-500"
          />
        </div>

        {/* Detailed Reports */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="aged-receivables">Aged Receivables</TabsTrigger>
            <TabsTrigger value="budget-variance">Budget Variance</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="cash-flow" className="space-y-6">
            {cashFlowData && (
              <CashFlowReportComponent
                data={cashFlowData}
                onRefresh={handleRefresh}
                onExport={handleExport}
                isLoading={isLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="aged-receivables" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Aged Receivables Report
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {agedReceivablesData ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <p className="text-gray-600 text-sm">
                              Total Outstanding
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              $
                              {agedReceivablesData.totalOutstanding.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <p className="text-gray-600 text-sm">Current</p>
                            <p className="text-2xl font-bold text-green-600">
                              $
                              {agedReceivablesData.currentAmount.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-6">
                          <div className="text-center">
                            <p className="text-gray-600 text-sm">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">
                              $
                              {agedReceivablesData.overdueAmount.toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Aging Buckets */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Aging Analysis</h3>
                      {agedReceivablesData.agingBuckets.map((bucket, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-32">
                              <p className="font-medium">{bucket.daysRange}</p>
                              <p className="text-sm text-gray-600">
                                {bucket.count} invoices
                              </p>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${bucket.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${bucket.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {bucket.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Data Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Generate an aged receivables report to see customer
                      payment aging
                    </p>
                    <Button>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget-variance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Variance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Budget Variance Reports
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Compare budgeted vs actual performance
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Budget Variance Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Custom Report Builder
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create custom reports with your preferred metrics and
                    layouts
                  </p>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Build Custom Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
