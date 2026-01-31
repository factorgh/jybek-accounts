"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { CashFlowReport } from "@/types/quickbooks-features";

interface CashFlowReportProps {
  data: CashFlowReport;
  onRefresh?: () => void;
  onExport?: (format: "pdf" | "excel" | "csv") => void;
  isLoading?: boolean;
}

export function CashFlowReportComponent({
  data,
  onRefresh,
  onExport,
  isLoading = false,
}: CashFlowReportProps) {
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

  const totalOperatingCash = data.operatingActivities.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalInvestingCash = data.investingActivities.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalFinancingCash = data.financingActivities.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const CashFlowSection = ({
    title,
    items,
    total,
    icon: Icon,
    color,
  }: {
    title: string;
    items: typeof data.operatingActivities;
    total: number;
    icon: React.ComponentType<any>;
    color: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span>{title}</span>
          </div>
          <Badge variant={total >= 0 ? "default" : "destructive"}>
            {formatCurrency(total)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.description}
                  </p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${item.amount >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions in this period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Cash Flow Statement
          </h2>
          <p className="text-gray-600">
            {formatDate(data.reportPeriod.startDate)} -{" "}
            {formatDate(data.reportPeriod.endDate)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.("excel")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Net Cash Flow</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.netIncreaseInCash)}
                </p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              {data.netIncreaseInCash >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>
                {data.netIncreaseInCash >= 0 ? "Positive" : "Negative"} cash
                flow
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Beginning Cash</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.cashAtBeginningOfPeriod)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ending Cash</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.cashAtEndOfPeriod)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Generated</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(data.generatedAt)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CashFlowSection
          title="Operating Activities"
          items={data.operatingActivities}
          total={totalOperatingCash}
          icon={Activity}
          color="bg-green-500"
        />

        <CashFlowSection
          title="Investing Activities"
          items={data.investingActivities}
          total={totalInvestingCash}
          icon={TrendingUp}
          color="bg-blue-500"
        />

        <CashFlowSection
          title="Financing Activities"
          items={data.financingActivities}
          total={totalFinancingCash}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Cash at beginning of period</span>
              <span className="font-medium">
                {formatCurrency(data.cashAtBeginningOfPeriod)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">
                Net cash from operating activities
              </span>
              <span
                className={`font-medium ${totalOperatingCash >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(totalOperatingCash)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">
                Net cash from investing activities
              </span>
              <span
                className={`font-medium ${totalInvestingCash >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(totalInvestingCash)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">
                Net cash from financing activities
              </span>
              <span
                className={`font-medium ${totalFinancingCash >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatCurrency(totalFinancingCash)}
              </span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-lg">
              <span>Cash at end of period</span>
              <span
                className={
                  data.cashAtEndOfPeriod >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {formatCurrency(data.cashAtEndOfPeriod)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
