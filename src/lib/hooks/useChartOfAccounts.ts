import { useState, useEffect } from "react";

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

      const response = await fetch("/api/chart-of-accounts");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAccounts(data.data);
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

      const response = await fetch("/api/chart-of-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAccounts((prev) => [...prev, data.data]);
        return { success: true, data: data.data };
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

      const response = await fetch(`/api/chart-of-accounts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAccounts((prev) => prev.map((a) => (a.id === id ? data.data : a)));
        return { success: true, data: data.data };
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

      const response = await fetch(`/api/chart-of-accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
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
