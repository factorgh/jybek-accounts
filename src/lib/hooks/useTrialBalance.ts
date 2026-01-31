import { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";

interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  accountType: "asset" | "liability" | "equity" | "income" | "expense";
  debitBalance: number;
  creditBalance: number;
}

interface TrialBalanceSummary {
  totalDebits: number;
  totalCredits: number;
  isBalanced: boolean;
  difference: number;
  asOfDate: string;
  period: string;
}

interface TrialBalanceData {
  trialBalance: TrialBalanceItem[];
  summary: TrialBalanceSummary;
}

export function useTrialBalance(period?: string) {
  const [trialBalanceData, setTrialBalanceData] =
    useState<TrialBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialBalance = async (selectedPeriod?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/financial-statements/trial-balance${selectedPeriod ? `?period=${selectedPeriod}` : ""}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setTrialBalanceData(data.data);
      } else {
        setError("Failed to fetch trial balance");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance(period);
  }, [period]);

  const downloadTrialBalance = () => {
    if (!trialBalanceData) return;

    // Create CSV content
    let csv =
      "Account Code,Account Name,Account Type,Debit Balance,Credit Balance\n";

    trialBalanceData.trialBalance.forEach((item) => {
      csv += `${item.accountCode},"${item.accountName}",${item.accountType},${item.debitBalance},${item.creditBalance}\n`;
    });

    csv += `\nSummary,,Current Period\n`;
    csv += `,,Total Debits,${trialBalanceData.summary.totalDebits}\n`;
    csv += `,,Total Credits,${trialBalanceData.summary.totalCredits}\n`;
    csv += `,,Is Balanced,${trialBalanceData.summary.isBalanced ? "YES" : "NO"}\n`;
    csv += `,,Difference,${trialBalanceData.summary.difference}\n`;

    // Download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial-balance-${trialBalanceData.summary.asOfDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refresh = () => {
    fetchTrialBalance(period);
  };

  return {
    trialBalance: trialBalanceData?.trialBalance || [],
    summary: trialBalanceData?.summary,
    isLoading,
    error,
    fetchTrialBalance,
    downloadTrialBalance,
    refresh,
  };
}
