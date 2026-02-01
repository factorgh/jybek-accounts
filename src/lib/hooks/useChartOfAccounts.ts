import { useState, useEffect } from "react";
import apiClient from "@/lib/api/client";

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export function useChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.getAccounts();

      if (response.success) {
        setAccounts(response.data);
      } else {
        setError("Failed to fetch accounts");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async (accountData: any) => {
    try {
      setError(null);

      const response = await apiClient.createAccount(accountData);

      if (response.success) {
        setAccounts((prev) => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        setError("Failed to create account");
        return { success: false, error: "Failed to create account" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateAccount = async (id: string, accountData: any) => {
    try {
      setError(null);

      const response = await apiClient.updateAccount(id, accountData);

      if (response.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? response.data : a)),
        );
        return { success: true, data: response.data };
      } else {
        setError("Failed to update account");
        return { success: false, error: "Failed to update account" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      setError(null);

      const response = await apiClient.deleteAccount(id);

      if (response.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      } else {
        setError("Failed to delete account");
        return { success: false, error: "Failed to delete account" };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    isLoading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
