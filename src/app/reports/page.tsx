"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExportButton from "@/components/ui/export-button";
import {
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  Calendar,
  Filter,
  Activity,
} from "lucide-react";

import {
  CashFlowReport,
  AgedReceivablesReport,
} from "@/types/quickbooks-features";
import { CashFlowReportComponent } from "@/components/reports/CashFlowReport";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("cash-flow");
  const [cashFlowData, setCashFlowData] = useState<CashFlowReport | null>(null);
  const [agedReceivablesData, setAgedReceivablesData] =
    useState<AgedReceivablesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Utility: Currency formatter
  const formatCurrency = (value?: number) =>
    `$${(value ?? 0).toLocaleString()}`;

  useEffect(() => {
    // TODO: Replace with real API calls
    setCashFlowData(null);
    setAgedReceivablesData(null);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real fetch logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsLoading(false);
    }
  };

  // Build export data safely
  const agedReceivablesExportData = useMemo(() => {
    if (!agedReceivablesData) return [];

    return [
      {
        "Report Type": "Aged Receivables",
        "Total Outstanding": agedReceivablesData.totalOutstanding ?? 0,
        "Current Amount": agedReceivablesData.currentAmount ?? 0,
        "Overdue Amount": agedReceivablesData.overdueAmount ?? 0,
      },
      ...(agedReceivablesData.agingBuckets?.map((bucket) => ({
        Period: bucket.daysRange,
        Invoices: bucket.count,
        Amount: bucket.amount,
        Percentage: `${bucket.percentage}%`,
      })) ?? []),
    ];
  }, [agedReceivablesData]);

  const ReportCard = ({
    title,
    description,
    icon: Icon,
    count,
    color,
  }: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: string;
    color: string;
  }) => {
    return (
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
                <p className="text-xs text-gray-500 mt-1">{count} available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Financial Reports
                </h1>
                <p className="text-gray-600 mt-2">
                  Generate and analyze business financial performance
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Real-time Data
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Reports"
            value="12"
            icon={FileText}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            label="This Month"
            value="8"
            icon={TrendingUp}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            label="Scheduled"
            value="3"
            icon={Calendar}
            gradient="from-purple-500 to-purple-600"
          />
          <StatCard
            label="Last Generated"
            value="2h"
            icon={RefreshCw}
            gradient="from-orange-500 to-orange-600"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ReportCard
            title="Cash Flow Statement"
            description="IAS 7 compliant analysis"
            icon={DollarSign}
            count="3 variants"
            color="bg-green-500"
          />
          <ReportCard
            title="Aged Receivables"
            description="Customer aging analysis"
            icon={Users}
            count="2 variants"
            color="bg-blue-500"
          />
          <ReportCard
            title="Budget Variance"
            description="Budget vs actual"
            icon={TrendingUp}
            count="5 variants"
            color="bg-purple-500"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="aged-receivables">Aged Receivables</TabsTrigger>
            <TabsTrigger value="budget-variance">Budget Variance</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Cash Flow */}
          <TabsContent value="cash-flow">
            {cashFlowData ? (
              <CashFlowReportComponent
                data={cashFlowData}
                onRefresh={handleRefresh}
                onExport={() => {}}
                isLoading={isLoading}
              />
            ) : (
              <EmptyState
                icon={Activity}
                title="No Cash Flow Data"
                description="Generate reports to analyze liquidity"
              />
            )}
          </TabsContent>

          {/* Aged Receivables */}
          <TabsContent value="aged-receivables">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  Aged Receivables Report
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <ExportButton
                      data={agedReceivablesExportData}
                      filename="aged-receivables-report"
                      title="Export"
                    />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {agedReceivablesData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                      label="Total Outstanding"
                      value={formatCurrency(
                        agedReceivablesData.totalOutstanding,
                      )}
                    />
                    <SummaryCard
                      label="Current"
                      value={formatCurrency(agedReceivablesData.currentAmount)}
                      color="text-green-600"
                    />
                    <SummaryCard
                      label="Overdue"
                      value={formatCurrency(agedReceivablesData.overdueAmount)}
                      color="text-red-600"
                    />
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No Data Available"
                    description="Generate an aged receivables report"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget-variance">
            <EmptyState
              icon={TrendingUp}
              title="Budget Variance Reports"
              description="Compare budget vs actual performance"
            />
          </TabsContent>

          <TabsContent value="custom">
            <EmptyState
              icon={FileText}
              title="Custom Reports"
              description="Build reports with custom metrics"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------- Small Reusable Components ---------- */

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <Card className={`bg-gradient-to-r ${gradient} text-white`}>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-6 w-6" />
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
